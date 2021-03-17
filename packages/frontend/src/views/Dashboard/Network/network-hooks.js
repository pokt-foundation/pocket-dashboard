import axios from "axios";
import { request as gqlRequest, gql } from "graphql-request";
import { useQuery } from "react-query";
import env from "environment";

const RELAY_APPS_QUERY = gql`
  query DAILY_RELAYS_QUERY {
    relays_daily(limit: 7, order_by: { bucket: desc }) {
      bucket
      total_relays
    }
  }
`;

const SUCCESSFUL_WEEKLY_RELAY_COUNT_QUERY = gql`
  query DAILY_RELAYS_QUERY($_gte: timestamptz = "2021-03-08T16:00:00+00:00") {
    relay_apps_hourly_aggregate(
      where: { bucket: { _gte: $_gte }, result: { _eq: "200" } }
    ) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`;

export function useNetworkSummary() {
  const {
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    data: summaryData,
  } = useQuery("/network/summary", async function getNetworkSummary() {
    const path = `${env("BACKEND_URL")}/api/network/summary`;

    try {
      const res = await axios.get(path, {
        withCredentials: true,
      });

      console.log("res", res);

      return res;
    } catch (err) {
      console.log("?", err);
    }
  });

  return {
    isSummaryError,
    isSummaryLoading,
    summaryData,
  };
}

export function useChains() {
  const {
    isLoading: isChainsLoading,
    isError: isChainsError,
    data: chains,
  } = useQuery("/network/chains", async function getNetworkChains() {
    const path = `${env("BACKEND_URL")}/api/network/chains`;

    try {
      const res = await axios.get(path, {
        withCredentials: true,
      });

      const {
        data: { chains },
      } = res;

      return chains;
    } catch (err) {
      console.log("?", err);
    }
  });

  return {
    isChainsError,
    isChainsLoading,
    chains,
  };
}

export function useTotalWeeklyRelays() {
  const {
    isLoading: isRelaysLoading,
    isError: isRelaysError,
    data: relayData,
  } = useQuery("network/weekly-relays", async function getWeeklyRelays() {
    try {
      console.log(env("HASURA_URL"));
      const res = await gqlRequest(env("HASURA_URL"), RELAY_APPS_QUERY);

      const { relays_daily: dailyRelays } = res;
      const totalWeeklyRelays = dailyRelays.reduce(
        (total, { total_relays }) => total + total_relays,
        0
      );

      return { dailyRelays, totalWeeklyRelays };
    } catch (err) {
      console.log(err, "rip");
    }
  });

  return {
    isRelaysError,
    isRelaysLoading,
    relayData,
  };
}

export function useNetworkSuccessRate() {
  const {
    isLoading: isSuccessRateLoading,
    isError: isSuccessRateError,
    data: successRateData,
  } = useQuery("network/success-rate", async function getWeeklyRelays() {
    try {
      const res = await gqlRequest(
        env("HASURA_URL"),
        SUCCESSFUL_WEEKLY_RELAY_COUNT_QUERY
      );

      const {
        relay_apps_hourly_aggregate: {
          aggregate: {
            sum: { total_relays: totalSuccessfulWeeklyRelays },
          },
        },
      } = res;

      return { totalSuccessfulWeeklyRelays };
    } catch (err) {
      console.log(err, "rip");
    }
  });

  return {
    isSuccessRateError,
    isSuccessRateLoading,
    successRateData,
  };
}
