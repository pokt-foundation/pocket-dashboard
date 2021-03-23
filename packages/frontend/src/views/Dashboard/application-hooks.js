import axios from "axios";
import * as dayjs from "dayjs";
import * as dayJsutcPlugin from "dayjs/plugin/utc";
import { gql, request as gqlRequest } from "graphql-request";
import { useParams } from "react-router";
import { useQuery } from "react-query";
import env from "environment";

const TOTAL_RELAYS_AND_AVG_LATENCY_QUERY = gql`
  query TOTAL_RELAYS_AND_AVG_LATENCY_QUERY($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        elapsed_time: { _lt: "1" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`;

const WEEKLY_SUCCESSFUL_RELAYS_QUERY = gql`
  query SUCCESSFUL_WEEKLY_RELAYS($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        elapsed_time: { _lt: "3" }
        result: { _eq: "200" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`;

const DAILY_APP_RELAYS_QUERY = gql`
  query DAILY_RELAYS_QUERY($_eq: String, $_gte: timestamptz) {
    relay_apps_daily(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      bucket
      total_relays
    }
  }
`;

const AVG_SESSION_RELAY_COUNT_QUERY = gql`
  query AVG_SESSION_RELAY_COUNT($_eq: String, $_gte: timestamptz) {
    relay_apps_hourly_aggregate(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: asc }
    ) {
      aggregate {
        avg {
          total_relays
        }
      }
    }
  }
`;

const LATEST_RELAYS_QUERY = gql`
  query LATEST_RELAYS($_eq: String, $limit: Int, $offset: Int) {
    relay(
      limit: $limit
      offset: $offset
      order_by: { timestamp: desc }
      where: { app_pub_key: { _eq: $_eq } }
    ) {
      service_node
      method
      result
      bytes
      timestamp
    }
  }
`;

export function useUserApplications() {
  const {
    isLoading: isAppsLoading,
    isError: isAppsError,
    data: appsData,
    refetch: refetchUserApps,
  } = useQuery("user/applications", async function getUserApplications() {
    const path = `${env("BACKEND_URL")}/api/applications`;

    try {
      const { data } = await axios.get(path, {
        withCredentials: true,
      });

      const userApps = data.map(({ name, _id, ...rest }) => ({
        appName: name,
        appId: _id,
        ...rest,
      }));

      return userApps;
    } catch (err) {
      // TODO: Send to sentry
      console.log(err, "rip");
    }
  });

  return {
    appsData,
    isAppsError,
    isAppsLoading,
    refetchUserApps,
  };
}

export function useActiveApplication() {
  const { appId } = useParams();

  const {
    isLoading: isAppLoading,
    isError: isAppError,
    data: appData,
  } = useQuery(
    `user/applications/${appId ?? "NO_APPLICATION"}`,
    async function getActiveApplication() {
      if (!appId) {
        return null;
      }

      const path = `${env("BACKEND_URL")}/api/applications/${appId}`;

      try {
        const { data } = await axios.get(path, {
          withCredentials: true,
        });

        console.log(data);

        return data;
      } catch (err) {
        console.log(err);
      }
    }
  );

  return {
    appData,
    isAppError,
    isAppLoading,
  };
}

export function useWeeklyAppRelaysInfo(appPubKey = "") {
  const {
    isLoading: isWeeklyAppRelaysLoading,
    isError: isWeeklyAppRelaysError,
    data: weeklyRelaysData,
  } = useQuery(
    `user/applications/${appPubKey}/weekly-relays-avg-latency`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null;
      }

      dayjs.extend(dayJsutcPlugin);

      const sevenDaysAgo = dayjs.utc().subtract(7, "day");

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`;

      try {
        const res = await gqlRequest(
          env("HASURA_URL"),
          TOTAL_RELAYS_AND_AVG_LATENCY_QUERY,
          {
            _eq: appPubKey,
            _gte: formattedTimestamp,
          }
        );

        const {
          relay_apps_daily_aggregate: {
            aggregate: {
              avg: { elapsed_time: avgLatency },
              sum: { total_relays: weeklyAppRelays },
            },
          },
        } = res;

        return { avgLatency, weeklyAppRelays };
      } catch (err) {
        console.log(err, "rip");
      }
    }
  );

  return {
    isWeeklyAppRelaysError,
    isWeeklyAppRelaysLoading,
    weeklyRelaysData,
  };
}

export function useSucessfulWeeklyRelays(appPubKey) {
  const {
    isLoading: isSuccesfulWeeklyRelaysLoading,
    isError: isSuccessfulWeeklyRelaysError,
    data: successfulWeeklyRelaysData,
  } = useQuery(
    `user/applications/${appPubKey}/sucessful-weekly-relays`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null;
      }

      dayjs.extend(dayJsutcPlugin);

      const sevenDaysAgo = dayjs.utc().subtract(7, "day");

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`;

      try {
        const res = await gqlRequest(
          env("HASURA_URL"),
          WEEKLY_SUCCESSFUL_RELAYS_QUERY,
          {
            _eq: appPubKey,
            _gte: formattedTimestamp,
          }
        );

        const {
          relay_apps_daily_aggregate: {
            aggregate: {
              avg: { elapsed_time: avgLatency },
              sum: { total_relays: successfulWeeklyRelays },
            },
          },
        } = res;

        return { avgLatency, successfulWeeklyRelays };
      } catch (err) {
        console.log(err, "rip");
      }
    }
  );

  return {
    isSuccesfulWeeklyRelaysLoading,
    isSuccessfulWeeklyRelaysError,
    successfulWeeklyRelaysData,
  };
}

export function useDailyRelayCount(appPubKey) {
  const {
    isError: isDailyRelayCountError,
    isLoading: isDailyRelayCountLoading,
    data: dailyRelayCountData,
  } = useQuery(
    `user/applications/${appPubKey}/daily-app-count`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null;
      }

      dayjs.extend(dayJsutcPlugin);

      const sevenDaysAgo = dayjs.utc().subtract(7, "day");

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`;

      try {
        const res = await gqlRequest(
          env("HASURA_URL"),
          DAILY_APP_RELAYS_QUERY,
          {
            _eq: appPubKey,
            _gte: formattedTimestamp,
          }
        );

        const { relay_apps_daily: rawDailyRelays } = res;

        const dailyRelays = new Map();

        for (const {
          bucket,
          total_relays: dailyRelayCount,
        } of rawDailyRelays) {
          if (!dailyRelays.has(bucket)) {
            dailyRelays.set(bucket, dailyRelayCount);
          } else {
            const currentCount = dailyRelays.get(bucket);

            dailyRelays.set(
              bucket,
              Number(currentCount) + Number(dailyRelayCount)
            );
          }
        }

        const processedDailyRelays = [];

        for (const [bucket, dailyRelayCount] of dailyRelays.entries()) {
          processedDailyRelays.push({ bucket, dailyRelays: dailyRelayCount });
        }

        return processedDailyRelays;
      } catch (err) {
        console.log(err, "rip");
      }
    }
  );

  return {
    isDailyRelayCountError,
    isDailyRelayCountLoading,
    dailyRelayCountData,
  };
}

export function useAvgSessionRelayCount(appPubKey) {
  const {
    isLoading: isAvgSessionRelayCountLoading,
    isError: isAvgSessionRelayCountError,
    data: avgSessionRelayCount,
  } = useQuery(
    `user/applications/${appPubKey}/avg-session-count`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null;
      }

      dayjs.extend(dayJsutcPlugin);

      const sevenDaysAgo = dayjs.utc().subtract(7, "day");

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`;

      try {
        const res = await gqlRequest(
          env("HASURA_URL"),
          AVG_SESSION_RELAY_COUNT_QUERY,
          {
            _eq: appPubKey,
            _gte: formattedTimestamp,
          }
        );

        const {
          relay_apps_hourly_aggregate: {
            aggregate: {
              avg: { total_relays: avgRelaysPerSession },
            },
          },
        } = res;

        console.log(avgRelaysPerSession);

        return { avgRelaysPerSession };
      } catch (err) {
        console.log(err, "rip");
      }
    }
  );

  return {
    isAvgSessionRelayCountLoading,
    isAvgSessionRelayCountError,
    avgSessionRelayCount,
  };
}

export function useLatestRelays(appPubKey, page = 0, limit = 10) {
  const {
    isLoading: isLatestRelaysLoading,
    isError: isLatestRelaysError,
    data: latestRelayData,
  } = useQuery(
    [`user/applications/${appPubKey}/latest-relays`, page],
    async function getLatestRelays() {
      if (!appPubKey) {
        return null;
      }

      try {
        const res = await gqlRequest(env("HASURA_URL"), LATEST_RELAYS_QUERY, {
          _eq: appPubKey,
          limit,
          offset: page,
        });

        const { relay: latestRelays } = res;

        console.log(latestRelays);
        return { latestRelays };
      } catch (err) {
        console.log(err, "rip");
      }
    }
  );

  return {
    isLatestRelaysLoading,
    isLatestRelaysError,
    latestRelayData,
  };
}
