/* eslint-disable no-prototype-builtins */
import dayjs from "dayjs";
import dayJsutcPlugin from "dayjs/plugin/utc";
import { gql, GraphQLClient } from "graphql-request";
import MailgunService from "../services/MailgunService";
import Application from "../models/Application";
import User from "../models/User";
import env from "../environment";
const LAST_SENT_SUFFIX = "LastSent";
// @ts-expect-error ts-migrate(2769) FIXME: No overload matches this call.
const THRESHOLDS = new Map([
  ["quarter", 25000],
  ["half", 50000],
  ["threeQuarters"],
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
// @ts-expect-error ts-migrate(2345) FIXME: Argument of type 'string | boolean | Record<string... Remove this comment to see the full error message
const gqlClient = new GraphQLClient(env("HASURA_URL"), {
  headers: {
    "x-hasura-admin-secret": env("HASURA_SECRET"),
  },
});

async function fetchRelayData(publicKey) {
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
function calculateExceededThreshold(servedRelays) {
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
  const applications = await Application.find({
    status: { $exists: true },
    notificationSettings: { $exists: true },
  });

  for (const application of applications) {
    const {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'freeTierApplicationAccount' does not exi... Remove this comment to see the full error message
      freeTierApplicationAccount,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'notificationSettings' does not exist on ... Remove this comment to see the full error message
      notificationSettings,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'user' does not exist on type 'Document<a... Remove this comment to see the full error message
      user: userId,
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'name' does not exist on type 'Document<a... Remove this comment to see the full error message
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
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'email' does not exist on type 'Document<... Remove this comment to see the full error message
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
