import React from "react";
import "styled-components/macro";
import { CircleGraph, LineChart, Split, GU } from "ui";
import Box from "components/Box/Box";

const LINES = [{ id: 1, values: [0.1, 0.8, 0.4, 1] }];

const LABELS = ["", "", "", ""];

export default function RelayInfo() {
  return (
    <Split
      primary={
        <Box title="Total Relays">
          <div
            css={`
              display: flex;
              align-items: center;
              span {
                margin: ${1 * GU}px;
              }
            `}
          >
            <span
              css={`
                display: inline-block;
                background: #ffffff;
                border-radius: 50%;
                width: 16px;
                height: 16px;
              `}
            />{" "}
            245,000
          </div>
          <LineChart
            lines={LINES}
            label={(index) => LABELS[index]}
            backgroundFill="#1B2331"
            height={150}
            color={() => `#ffffff`}
            borderColor={`rgba(0,0,0,0)`}
          />
        </Box>
      }
      secondary={
        <Box title="Relay Success rate">
          <CircleGraph
            color="white"
            size={20 * GU}
            strokeWidth={10}
            value={0.74}
          />
        </Box>
      }
    />
  );
}
