import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useQuery } from "react-query";
import { GraphQLClient, gql } from "graphql-request";
import { useViewport } from "use-viewport";
import Styled from "styled-components/macro";
import {
  Button,
  ButtonBase,
  CircleGraph,
  DataView,
  Spacer,
  Split,
  textStyle,
  useTheme,
  useToast,
  GU,
  TextCopy,
} from "ui";
import AppStatus from "components/AppStatus/AppStatus";
import Box from "components/Box/Box";
import FloatUp from "components/FloatUp/FloatUp";
import env from "environment";
import Pagination from "ui/Pagination/Pagination";
import { shortenAddress } from "lib/pocket-utils";

const FAILED_RELAYS_KEY = "failedRelays";
const SUCCESSFUL_CODE = 200;
const SUCCESSFUL_RELAYS_KEY = "successfulRelays";
const SKIP_AMOUNT = 10;

const gqlClient = new GraphQLClient(env("HASURA_URL"), {
  headers: {
    "x-hasura-admin-secret": env("HASURA_SECRET"),
  },
});

const LATEST_SUCCESFUL_QUERIES = gql`
  query LATEST_FILTERED_RELAYS($_eq: String, $_eq1: numeric, $offset: Int) {
    relay(
      limit: 10
      where: { app_pub_key: { _eq: $_eq }, result: { _eq: $_eq1 } }
      order_by: { timestamp: desc }
      offset: $offset
    ) {
      method
      result
      elapsed_time
      bytes
      service_node
    }
  }
`;

const LATEST_FAILING_QUERIES = gql`
  query LATEST_FILTERED_RELAYS($_eq: String, $_eq1: numeric, $offset: Int) {
    relay(
      limit: 10
      where: { app_pub_key: { _eq: $_eq }, result: { _neq: $_eq1 } }
      order_by: { timestamp: desc }
      offset: $offset
    ) {
      method
      result
      elapsed_time
      bytes
      service_node
    }
  }
`;

export default function SuccessDetails({
  appOnChainData,
  latestRelaysData,
  successfulRelayData,
  weeklyRelayData,
}) {
  const [page, setPage] = useState(0);
  const [activeKey, setActiveKey] = useState(SUCCESSFUL_RELAYS_KEY);
  const history = useHistory();
  const theme = useTheme();
  const toast = useToast();
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  const { public_key: publicKey } = appOnChainData;

  const { isLoading, isError, data } = useQuery(
    [`user/applications/${publicKey}/success-details`, page],
    async function getFilteredRelays() {
      if (!publicKey) {
        return [];
      }

      console.log(page);

      try {
        const { relay: successfulRelays } = await gqlClient.request(
          LATEST_SUCCESFUL_QUERIES,
          {
            _eq: publicKey,
            _eq1: SUCCESSFUL_CODE,
            offset: page * SKIP_AMOUNT,
          }
        );

        const { relay: failedRelays } = await gqlClient.request(
          LATEST_FAILING_QUERIES,
          {
            _eq: publicKey,
            _eq1: SUCCESSFUL_CODE,
            offset: page * SKIP_AMOUNT,
          }
        );

        console.log(successfulRelays, failedRelays, "boom");

        return { successfulRelays, failedRelays };
      } catch (err) {
        console.log(Object.entries(err));
      }
    },
    {
      keepPreviousData: true,
    }
  );

  useEffect(() => {
    console.log(isLoading, isError, data, "stuff");
  }, [isLoading, isError, data]);

  const onSuccessfulClick = useCallback(
    () => setActiveKey(SUCCESSFUL_RELAYS_KEY),
    []
  );
  const onFailedClick = useCallback(() => setActiveKey(FAILED_RELAYS_KEY), []);
  const successRate = useMemo(() => {
    return weeklyRelayData.weeklyAppRelays === 0
      ? 0
      : successfulRelayData.successfulWeeklyRelays /
          weeklyRelayData.weeklyAppRelays;
  }, [weeklyRelayData, successfulRelayData]);
  const failureRate = useMemo(() => {
    return weeklyRelayData.weeklyAppRelays === 0
      ? 0
      : (weeklyRelayData.weeklyAppRelays -
          successfulRelayData.successfulWeeklyRelays) /
          weeklyRelayData.weeklyAppRelays;
  }, [successfulRelayData, weeklyRelayData]);
  const onPageChange = useCallback((page) => setPage(page), []);

  const displayData = useMemo(() => {
    if (activeKey === SUCCESSFUL_RELAYS_KEY) {
      return data?.successfulRelays ?? [];
    } else {
      return data?.failedRelays ?? [];
    }
  }, [activeKey, data]);

  return (
    <FloatUp
      loading={false}
      content={() => (
        <Split
          primary={
            <>
              <Box padding={[3 * GU, 4 * GU, 3 * GU, 4 * GU]}>
                <div
                  css={`
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    width: 100%;
                    height: 100%;
                    ${compactMode &&
                    `
                      flex-direction: column;
                    `}
                  `}
                >
                  <div
                    css={`
                      display: flex;
                      flex-direction: column;
                    `}
                  >
                    <h2
                      css={`
                        ${textStyle("title1")}
                      `}
                    >
                      {Intl.NumberFormat().format(
                        weeklyRelayData.weeklyAppRelays
                      )}
                      <span
                        css={`
                          display: block;
                          ${textStyle("title3")}
                        `}
                      >
                        Total requests
                      </span>
                      <span
                        css={`
                          ${textStyle("body3")}
                        `}
                      >
                        Last 7 days count
                      </span>
                    </h2>
                  </div>
                  <Inline>
                    <CircleGraph
                      value={Math.min(successRate, 1)}
                      size={12 * GU}
                      color={theme.positive}
                    />
                    <Spacer size={1 * GU} />
                    <div>
                      <h2
                        css={`
                          ${textStyle("title2")}
                        `}
                      >
                        {Intl.NumberFormat().format(
                          successfulRelayData.successfulWeeklyRelays
                        )}
                        <span
                          css={`
                            display: block;
                            ${textStyle("body3")}
                          `}
                        >
                          Processed requests
                        </span>
                      </h2>
                      <h2
                        css={`
                          ${textStyle("title3")}
                        `}
                      >
                        Success rate
                      </h2>
                    </div>
                  </Inline>
                  <Inline>
                    <CircleGraph
                      value={Math.max(0, failureRate)}
                      size={12 * GU}
                      color={theme.negative}
                    />
                    <Spacer size={1 * GU} />
                    <div>
                      <h2
                        css={`
                          ${textStyle("title2")}
                        `}
                      >
                        {Intl.NumberFormat().format(
                          weeklyRelayData.weeklyAppRelays -
                            successfulRelayData.successfulWeeklyRelays
                        )}
                        <span
                          css={`
                            display: block;
                            ${textStyle("body3")}
                          `}
                        >
                          Dropped requests
                        </span>
                      </h2>
                      <h2
                        css={`
                          ${textStyle("title3")}
                        `}
                      >
                        Failure rate
                      </h2>
                    </div>
                  </Inline>
                </div>
              </Box>
              <Spacer size={2 * GU} />
              <Box padding={[0, 0, 0, 0]}>
                <div
                  css={`
                    display: flex;
                    justify-content: space-between;
                  `}
                >
                  <Spacer size={2 * GU} />
                  <Tab
                    active={activeKey === SUCCESSFUL_RELAYS_KEY}
                    onClick={onSuccessfulClick}
                  >
                    Successful requests
                  </Tab>
                  <Tab
                    active={activeKey === FAILED_RELAYS_KEY}
                    onClick={onFailedClick}
                  >
                    Failed requests
                  </Tab>
                  <Spacer size={2 * GU} />
                </div>
                <Spacer size={5 * GU} />
                <DataView
                  fields={[
                    "",
                    "Request type",
                    "Bytes transferred",
                    "Service Node",
                  ]}
                  entries={displayData}
                  renderEntry={({
                    bytes,
                    method,
                    service_node: serviceNode,
                  }) => {
                    return [
                      <div
                        css={`
                          display: inline-block;
                          width: ${1.5 * GU}px;
                          height: ${1.5 * GU}px;
                          border-radius: 50% 50%;
                          background: ${activeKey === SUCCESSFUL_RELAYS_KEY
                            ? theme.positive
                            : theme.negative};
                          box-shadow: ${activeKey === SUCCESSFUL_RELAYS_KEY
                              ? theme.positive
                              : theme.negative}
                            0px 2px 8px 0px;
                        `}
                      />,
                      <p>{method}</p>,
                      <p>{bytes}B</p>,
                      <TextCopy
                        value={shortenAddress(serviceNode, 16)}
                        onCopy={() => toast("Node address copied to cliboard")}
                        css={`
                          width: 100%;
                          > div > input {
                            background: transparent;
                          }
                        `}
                      />,
                    ];
                  }}
                  status={isLoading ? "loading" : "default"}
                />
                <Pagination
                  pages={10}
                  selected={page}
                  onChange={onPageChange}
                />
              </Box>
            </>
          }
          secondary={
            <>
              <Button wide mode="strong" onClick={() => history.goBack()}>
                Back to application
              </Button>
              <Spacer size={2 * GU} />
              <AppStatus appOnChainStatus={appOnChainData} />
            </>
          }
        />
      )}
    />
  );
}

function Tab({ active, children, onClick }) {
  const theme = useTheme();

  return (
    <ButtonBase
      onClick={onClick}
      css={`
        position: relative;
        height: ${6 * GU}px;
        width: 100%;
        border-radius: 0 0 ${1 * GU}px ${1 * GU}px;
        color: ${theme.infoSurfaceContent};
        ${textStyle("body2")}
        ${active &&
        `
          background: #091828;
          border-top: 2px solid ${theme.accent};
          color: white;
          transition: all 0.080s ease-in;
        `}
      `}
    >
      {children}
    </ButtonBase>
  );
}

const Inline = Styled.div`
  display: flex;
  align-items: center;
`;
