import React from "react";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import { Spacer, Split, Table, TableCell, TableHeader, TableRow, GU } from "ui";
import Box from "components/Box/Box";

export default function RelayInfo() {
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
                  <TableHeader title="Staked apps" />
                </TableRow>
              </>
            }
          >
            <TableRow>
              <TableCell>
                <p>Ethereum Mainnet</p>
              </TableCell>
              <TableCell>
                <p>0021</p>
              </TableCell>
              <TableCell>
                <p>ETH</p>
              </TableCell>
              <TableCell>
                <p>600</p>
              </TableCell>
              <TableCell>
                <p>1400</p>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <p>Ethereum Mainnet</p>
              </TableCell>
              <TableCell>
                <p>0021</p>
              </TableCell>
              <TableCell>
                <p>ETH</p>
              </TableCell>
              <TableCell>
                <p>600</p>
              </TableCell>
              <TableCell>
                <p>1400</p>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                <p>Ethereum Mainnet</p>
              </TableCell>
              <TableCell>
                <p>0021</p>
              </TableCell>
              <TableCell>
                <p>ETH</p>
              </TableCell>
              <TableCell>
                <p>600</p>
              </TableCell>
              <TableCell>
                <p>1400</p>
              </TableCell>
            </TableRow>
          </Table>
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
              Total apps staked: <span>1,000</span>
            </li>
            <Spacer size={2 * GU} />
            <li>
              Total nodes staked: <span>1,900</span>
            </li>
            <Spacer size={2 * GU} />
            <li>
              Total POKT staked: <span>2,000,000</span>
            </li>
          </ul>
        </Box>
      }
      invert="horizontal"
    />
  );
}
