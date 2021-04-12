import React from "react";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import {
  CircleGraph,
  LineChart,
  Spacer,
  Split,
  useTheme,
  textStyle,
  GU,
} from "ui";
import Box from "components/Box/Box";

export default function RelayInfo({
  relayData,
  chartLines,
  chartLabels,
  scales,
  successRateData,
}) {
  const theme = useTheme();
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
          <Spacer size={1 * GU} />
          <LineChart
            backgroundFill="#1B2331"
            borderColor={`rgba(0,0,0,0)`}
            color={() => `#31A1D2`}
            dotRadius={GU / 1.5}
            height={240}
            label={(index) => chartLabels[index]}
            lines={chartLines}
            renderCheckpoints
            scales={scales}
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
              color={theme.positive}
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
