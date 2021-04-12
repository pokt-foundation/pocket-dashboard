import React, { useMemo } from "react";
import { format } from "d3-format";
import "styled-components/macro";
import { Spacer, textStyle, GU } from "ui";
import AnimatedLogo from "components/AnimatedLogo/AnimatedLogo";
import FloatUp from "components/FloatUp/FloatUp";
import RelayInfo from "views/Dashboard/Network/RelayInfo";
import NetworkInfo from "views/Dashboard/Network/NetworkInfo";
import {
  useNetworkSuccessRate,
  useTotalWeeklyRelays,
  useNetworkSummary,
  useChains,
} from "views/Dashboard/Network/network-hooks";
import { norm } from "lib/math-utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDailyRelaysForGraphing(dailyRelays) {
  const labels = dailyRelays
    .map(({ bucket }) => bucket.split("T")[0])
    .map((bucket) => DAYS[new Date(bucket).getUTCDay()]);

  const highestDailyAmount = dailyRelays.reduce(
    (highest, { total_relays: totalRelays }) => Math.max(highest, totalRelays),
    0
  );

  const lines = [
    {
      id: 1,
      values: dailyRelays.map(({ total_relays: totalRelays }) =>
        norm(totalRelays, 0, highestDailyAmount)
      ),
    },
  ];

  const formatSi = format(".2s");

  const scales = [
    0,
    formatSi((highestDailyAmount * 0.25).toFixed(0)),
    formatSi((highestDailyAmount * 0.5).toFixed(0)),
    formatSi((highestDailyAmount * 0.75).toFixed(0)),
    formatSi(highestDailyAmount.toFixed(0)),
  ];

  return {
    labels,
    lines,
    scales,
  };
}

export default function NetworkStatus() {
  const { isRelaysError, isRelaysLoading, relayData } = useTotalWeeklyRelays();
  const { isSuccessRateLoading, successRateData } = useNetworkSuccessRate();
  const { isSummaryLoading, summaryData } = useNetworkSummary();
  const { isChainsLoading, chains } = useChains();

  const { labels = [], lines = [], scales = [] } = useMemo(
    () =>
      isRelaysLoading || isRelaysError || relayData === undefined
        ? {}
        : formatDailyRelaysForGraphing(relayData.dailyRelays),
    [isRelaysError, isRelaysLoading, relayData]
  );

  const loading = useMemo(
    () =>
      isSuccessRateLoading ||
      isRelaysLoading ||
      isSummaryLoading ||
      isChainsLoading,
    [isChainsLoading, isRelaysLoading, isSuccessRateLoading, isSummaryLoading]
  );

  return loading ? (
    <div
      css={`
        position: relative;
        width: 100%;
        /* TODO: This is leaky. fix up with a permanent component */
        height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      <AnimatedLogo />
      <Spacer size={2 * GU} />
      <p
        css={`
          ${textStyle("body2")}
        `}
      >
        Loading network status...
      </p>
    </div>
  ) : (
    <FloatUp
      content={() => (
        <>
          <RelayInfo
            relayData={relayData}
            successRateData={successRateData}
            chartLines={lines}
            chartLabels={labels}
            scales={scales}
          />
          <Spacer size={2 * GU} />
          <NetworkInfo summaryData={summaryData} chains={chains} />
        </>
      )}
    />
  );
}
