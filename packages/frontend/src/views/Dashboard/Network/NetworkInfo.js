import React from "react";
import TokenAmount from "token-amount";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import {
  LoadingRing,
  Spacer,
  Split,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  GU,
} from "ui";
import Box from "components/Box/Box";
import {
  useNetworkSummary,
  useChains,
} from "views/Dashboard/Network/network-hooks";

export default function RelayInfo() {
  const { isSummaryLoading, summaryData } = useNetworkSummary();
  const { isChainsLoading, chains } = useChains();
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
          {isChainsLoading ? (
            <LoadingRing mode="half-circle" />
          ) : (
            <Table
              noSideBorders
              noTopBorders
              css={`
                background: transparent;
              `}
              header={
                <>
                  <TableRow>
                    <TableHeader title="Network" />
                    <TableHeader title="Network ID" />
                    <TableHeader title="Ticker" />
                    <TableHeader title="Node count" />
                  </TableRow>
                </>
              }
            >
              {chains.map(
                ({
                  id,
                  description,
                  ticker,
                  network,
                  nodeCount,
                  isAvailableForStaking,
                }) => (
                  <TableRow key={id}>
                    <TableCell>
                      <p>{description || network}</p>
                    </TableCell>
                    <TableCell>
                      <p>{id}</p>
                    </TableCell>
                    <TableCell>
                      <p>{ticker}</p>
                    </TableCell>
                    <TableCell>
                      <p>{nodeCount}</p>
                    </TableCell>
                  </TableRow>
                )
              )}
            </Table>
          )}
        </Box>
      }
      secondary={
        <Box title="Network stats">
          {isSummaryLoading ? (
            <LoadingRing mode="half-circle" />
          ) : (
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
          )}
        </Box>
      }
      invert="horizontal"
    />
  );
}
