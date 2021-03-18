import React, { useMemo } from "react";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import {
  CircleGraph,
  LineChart,
  LoadingRing,
  Spacer,
  Split,
  textStyle,
  GU,
} from "ui";
import Box from "components/Box/Box";
import {
  useNetworkSuccessRate,
  useTotalWeeklyRelays,
} from "views/Dashboard/Network/network-hooks";
import { norm } from "lib/math-utils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDailyRelaysForGraphing(dailyRelays) {
  const labels = dailyRelays
    .map(({ bucket }) => bucket.split("T")[0])
    .map((bucket) => DAYS[new Date(bucket).getUTCDay()])
    .reverse();

  const highestDailyAmount = dailyRelays.reduce(
    (highest, { total_relays: totalRelays }) => Math.max(highest, totalRelays),
    0
  );

  const lines = [
    {
      id: 1,
      values: dailyRelays
        .reverse()
        .map(({ total_relays: totalRelays }) =>
          norm(totalRelays, 0, highestDailyAmount)
        ),
    },
  ];

  console.log(lines.values, dailyRelays.reverse());
  return {
    labels,
    lines,
  };
}

export default function RelayInfo() {
  const { within } = useViewport();
  const { isRelaysError, isRelaysLoading, relayData } = useTotalWeeklyRelays();
  const { isSuccessRateLoading, successRateData } = useNetworkSuccessRate();

  const { labels = [], lines = [] } = useMemo(
    () =>
      isRelaysLoading || isRelaysError || relayData === undefined
        ? {}
        : formatDailyRelaysForGraphing(relayData.dailyRelays),
    [isRelaysError, isRelaysLoading, relayData]
  );

  const compactMode = within(-1, "medium");

  return (
    <Split
      primary={
        <Box>
          <div
            css={`
              display: flex;
              justify-content: space-between;
            `}
          >
            <h3
              css={`
                ${textStyle("title3")}
              `}
            >
              Total Relays
            </h3>

            {!isRelaysLoading && relayData && (
              <div
                css={`
                  text-align: right;
                `}
              >
                <h4
                  css={`
                    ${textStyle("title4")}
                  `}
                >
                  {Intl.NumberFormat().format(relayData.totalWeeklyRelays)}
                </h4>
                <h5>For the past week</h5>
              </div>
            )}
          </div>
          {isRelaysLoading && <LoadingRing mode="half-circle" />}
          {!isRelaysLoading && (
            <LineChart
              lines={lines}
              label={(index) => labels[index]}
              backgroundFill="#1B2331"
              height={240}
              color={() => `#31A1D2`}
              borderColor={`rgba(0,0,0,0)`}
            />
          )}
        </Box>
      }
      secondary={
        <Box title="Success Rate">
          {isSuccessRateLoading ||
          isRelaysLoading ||
          successRateData === undefined ||
          relayData === undefined ? (
            <LoadingRing mode="half-circle" />
          ) : (
            <div
              css={`
                display: flex;
                flex-direction: column;
                ${compactMode &&
                `
                  flex-direction: row;
                  justify-content: space-between;
                `}
              `}
            >
              <CircleGraph
                size={20 * GU}
                strokeWidth={GU}
                value={
                  successRateData.totalSuccessfulWeeklyRelays /
                  relayData.totalWeeklyRelays
                }
              />
              <Spacer size={2 * GU} />
              <div>
                <p
                  css={`
                    ${textStyle("title3")}
                  `}
                >
                  {Intl.NumberFormat().format(
                    successRateData.totalSuccessfulWeeklyRelays
                  )}
                </p>
                <p
                  css={`
                    ${textStyle("body2")}
                  `}
                >
                  Sucessful relays
                </p>
              </div>
            </div>
          )}
        </Box>
      }
    />
  );
}
