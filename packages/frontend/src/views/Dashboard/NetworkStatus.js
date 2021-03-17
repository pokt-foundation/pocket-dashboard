import React from "react";
import { useQuery } from "react-query";
import axios from "axios";
import { request as gqlRequest, gql } from "graphql-request";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import {
  CircleGraph,
  LineChart,
  Split,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  textStyle,
  GU,
  RADIUS,
} from "ui";
import FloatUp from "components/FloatUp/FloatUp";
import env from "environment";

const LINES = [{ id: 1, values: [0.1, 0.8, 0.4, 1] }];

const LABELS = ["", "", "", ""];

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

export default function NetworkStatus() {
  const { within } = useViewport();
  const compactMode = within(-1, "medium");

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
  const {
    isLoading: isRelaysLoading,
    isError: isRelaysError,
    data: isRelaysData,
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
  const {
    isLoading: isSucessRateLoading,
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
            sum: { total_relays: totalSucessfulWeeklyRelays },
          },
        },
      } = res;

      return { successRateData };
    } catch (err) {
      console.log(err, "rip");
    }
  });

  return (
    <FloatUp
      loading={false}
      content={() => (
        <>
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
            css={`
              margin-bottom: ${10 * GU}px;
            `}
          />
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
                    li:not(:last-child) {
                      margin-bottom: ${4 * GU}px;
                    }
                  `}
                >
                  <li>
                    Total apps staked: <span>1,000</span>
                  </li>
                  <li>
                    Total nodes staked: <span>1,900</span>
                  </li>
                  <li>
                    Total POKT staked: <span>2,000,000</span>
                  </li>
                  <li>
                    POKT price: <span>$0.13 USD</span>
                  </li>
                </ul>
              </Box>
            }
            invert="horizontal"
          />
        </>
      )}
    />
  );
}

function Box({ children, title, className, ...props }) {
  return (
    <div
      css={`
        background: #1b2331;
        min-height: ${35 * GU}px;
        padding: ${2 * GU}px ${2 * GU}px;
        border-radius: ${RADIUS * 2}px;
      `}
      className={className}
      {...props}
    >
      <h3
        css={`
          ${textStyle("title3")}
          margin-bottom: ${3 * GU}px;
        `}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}
