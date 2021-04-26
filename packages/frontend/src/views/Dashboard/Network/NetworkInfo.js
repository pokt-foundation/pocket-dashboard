import React from "react";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import { DataView, Spacer, Split, GU } from "ui";
import Box from "components/Box/Box";

const PER_PAGE = 5;

export default function RelayInfo({ chains, summaryData }) {
  const { within } = useViewport();
  const compactMode = within(-1, "medium");

  return (
    <Split
      primary={
        <Box title="Available chains">
          <DataView
            fields={["Network", "ID", "Ticker"]}
            entries={chains}
            mode={compactMode ? "list" : "table"}
            entriesPerPage={PER_PAGE}
            renderEntry={({ description, id, network, ticker }) => [
              <p>{description || network}</p>,
              <p>{id}</p>,
              <p>{ticker}</p>,
            ]}
          />
        </Box>
      }
      secondary={
        <Box title="Network Summary">
          <ul
            css={`
              list-style: none;
              height: 100%;
              li {
                display: flex;
                justify-content: space-between;
              }
            `}
          >
            <li>
              Total apps staked <span>{summaryData.appsStaked} </span>
            </li>
            <Spacer size={2 * GU} />
            <li>
              Total nodes staked <span>{3036}</span>
            </li>
            <Spacer size={2 * GU} />
            <li>
              Total POKT staked <span>{242.99}m</span>
            </li>
          </ul>
        </Box>
      }
    />
  );
}
