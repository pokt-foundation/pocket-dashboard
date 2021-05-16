/* eslint-disable no-prototype-builtins */
import dayjs from "dayjs";
import dayJsutcPlugin from "dayjs/plugin/utc";
import { gql, GraphQLClient } from "graphql-request";
import MailgunService from "../services/MailgunService";
import Application, { IApplication } from "../models/Application";
import User from "../models/User";
import env from "../environment";

const LAST_SENT_SUFFIX = "LastSent";

const THRESHOLDS = new Map([
  ["quarter", 25000],
  ["half", 50000],
  ["threeQuarters", 75000],
  ["full", 100000],
]);

const DAILY_RELAYS_QUERY = gql`
  query TOTAL_RELAYS_AND_AVG_LATENCY_QUERY($_eq: String, $_gte: timestamptz) {
    relay_apps_daily(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      total_relays
      result
      bucket
    }
  }
`;

const gqlClient = new GraphQLClient(env("HASURA_URL") as string, {
  headers: {
    "x-hasura-admin-secret": env("HASURA_SECRET") as string,
  },
});

async function fetchRelayData(publicKey: string) {
  dayjs.extend(dayJsutcPlugin);
  const today = dayjs.utc();
  const formattedTimestamp = `${today.year()}-0${
    today.month() + 1
  }-${today.date()}T00:00:00+00:00`;
  const res = await gqlClient.request(DAILY_RELAYS_QUERY, {
    _eq: publicKey,
    _gte: formattedTimestamp,
  });
  const { relay_apps_daily: rawDailyRelays = [] } = res;

  return rawDailyRelays;
}

function calculateSentRelays(rawDailyRelays) {
  const dailyRelays = new Map();

  for (const { bucket, total_relays: dailyRelayCount } of rawDailyRelays) {
    if (!dailyRelays.has(bucket)) {
      dailyRelays.set(bucket, dailyRelayCount);
    } else {
      const currentCount = dailyRelays.get(bucket);

      dailyRelays.set(bucket, Number(currentCount) + Number(dailyRelayCount));
    }
  }
  let servedRelays = 0;

  for (const [, dailyRelayCount] of dailyRelays.entries()) {
    servedRelays += dailyRelayCount;
  }
  return servedRelays;
}

function calculateExceededThreshold(servedRelays: number) {
  let highestThresholdExceeded = 0;
  let thresholdKey = "";

  for (const [key, threshold] of THRESHOLDS.entries()) {
    if (servedRelays > threshold) {
      highestThresholdExceeded = threshold;
      thresholdKey = key;
    }
  }
  return [thresholdKey, highestThresholdExceeded];
}

export function getTimeDifferenceExceeded(notificationSettings, thresholdKey) {
  if (!(`${thresholdKey}${LAST_SENT_SUFFIX}` in notificationSettings)) {
    return false;
  }
  // Edge case: if days are different no matter time elapsed we should be able to send the email
  const sent = dayjs(
    notificationSettings[`${thresholdKey}${LAST_SENT_SUFFIX}`]
  );
  const now = dayjs();

  if (sent.date() !== now.date()) {
    return true;
  }
  return (
    dayjs().diff(
      notificationSettings[`${thresholdKey}${LAST_SENT_SUFFIX}`] ?? dayjs(),
      "day"
    ) > 0
  );
}

export async function sendUsageNotifications(ctx) {
  const applications: IApplication[] = await Application.find({
    status: { $exists: true },
    notificationSettings: { $exists: true },
  });

  for (const application of applications) {
    const {
      freeTierApplicationAccount,
      notificationSettings,
      user: userId,
      name: appName,
      _id: appId,
    } = application;
    const { publicKey } = freeTierApplicationAccount;
    const rawDailyRelayData = await fetchRelayData(publicKey);
    const servedRelays = calculateSentRelays(rawDailyRelayData);
    const [thresholdKey, highestThresholdExceeded] = calculateExceededThreshold(
      servedRelays
    );
    const shouldSendNotification =
      highestThresholdExceeded > 0 &&
      notificationSettings[thresholdKey] &&
      getTimeDifferenceExceeded(notificationSettings, thresholdKey);

    if (shouldSendNotification) {
      const user = await User.findById(userId);

      if (!user) {
        ctx.logger.warn(
          `NOTICE(Notifications): Orphaned app ${appId}) from user ${userId} getting usage.`
        );
      }

      const { email: userEmail = "" } = user;
      const emailService = new MailgunService();
      const totalUsage = (
        (servedRelays / THRESHOLDS.get("full")) *
        100
      ).toFixed(2);

      ctx.logger.log(
        `Notifying app ${appName} (ID: ${appId}) from user ${userId} of ${totalUsage}% usage`
      );

      emailService.send({
        templateData: {
          app_name: appName,
          app_id: appId.toString(),
          usage: `${totalUsage}%`,
        },
        templateName: "NotificationThresholdHit",
        toEmail: userEmail,
      });
      (application as any).notificationSettings[
        `${thresholdKey}${LAST_SENT_SUFFIX}`
      ] = new Date(Date.now());
      await application.save();
    }
  }
}
