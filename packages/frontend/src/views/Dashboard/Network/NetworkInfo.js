import React from "react";
import TokenAmount from "token-amount";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import { DataView, Spacer, Split, GU } from "ui";
import Box from "components/Box/Box";

export default function RelayInfo({ chains, summaryData }) {
  const { within } = useViewport();
  const compactMode = within(-1, "medium");

  return (
    <Split
      primary={
        <Box
          title="Available chains"
          css={`
            ${!compactMode &&
            `
              max-height: ${56 * GU}px;
              overflow-y: scroll;
            `}
          `}
        >
          <DataView
            fields={["Network", "ID", "Ticker"]}
            entries={chains}
            renderEntry={({ description, id, network, ticker }) => [
              <p>{description || network}</p>,
              <p>{id}</p>,
              <p>{ticker}</p>,
            ]}
          />
        </Box>
      }
      secondary={
        <Box title="Network stats">
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
              Total apps staked: <span>{summaryData.appsStaked} </span>
            </li>
            <Spacer size={2 * GU} />
            <li>
              Total nodes staked: <span>{summaryData.nodesStaked}</span>
            </li>
            <Spacer size={2 * GU} />
            <li>
              Total POKT staked:{" "}
              <span>{TokenAmount.format(summaryData.poktStaked, 6)}</span>
            </li>
          </ul>
        </Box>
      }
      invert="horizontal"
    />
  );
}
