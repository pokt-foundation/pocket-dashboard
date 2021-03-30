import React from "react";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import { CircleGraph, LineChart, Spacer, Split, textStyle, GU } from "ui";
import Box from "components/Box/Box";

export default function RelayInfo({
  relayData,
  chartLines,
  chartLabels,
  successRateData,
}) {
  const { within } = useViewport();
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
          </div>
          <LineChart
            lines={chartLines}
            label={(index) => chartLabels[index]}
            backgroundFill="#1B2331"
            height={240}
            color={() => `#31A1D2`}
            borderColor={`rgba(0,0,0,0)`}
          />
        </Box>
      }
      secondary={
        <Box title="Success Rate">
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
        </Box>
      }
    />
  );
}
