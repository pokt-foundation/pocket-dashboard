import React, { useEffect, useMemo } from "react";
import { useHistory, useRouteMatch } from "react-router";
import { animated, useSpring } from "react-spring";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import {
  Button,
  CircleGraph,
  LineChart,
  Spacer,
  Split,
  TextCopy,
  Table,
  TableCell,
  TableHeader,
  TableRow,
  textStyle,
  GU,
  RADIUS,
  ButtonBase,
} from "ui";
import AppStatus from "components/AppStatus/AppStatus";
import Box from "components/Box/Box";
import FloatUp from "components/FloatUp/FloatUp";
import { prefixFromChainId } from "lib/chain-utils";
import { norm } from "lib/math-utils";

const APP_ID = "60010a10eea5fb002e5bc536";

const ONE_MILLION = 800000;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDailyRelaysForGraphing(dailyRelays) {
  const labels = dailyRelays
    .map(({ bucket }) => bucket.split("T")[0])
    .map((bucket) => DAYS[new Date(bucket).getUTCDay()]);

  const highestDailyAmount = dailyRelays.reduce(
    (highest, { dailyRelays }) => Math.max(highest, dailyRelays),
    0
  );

  const lines = [
    {
      id: 1,
      values: dailyRelays.map(({ dailyRelays }) =>
        norm(dailyRelays, 0, ONE_MILLION)
      ),
    },
  ];

  console.log(lines, highestDailyAmount);

  return {
    labels,
    lines,
  };
}

export default function AppInfo({
  appData,
  avgSessionRelayCount,
  dailyRelayData,
  latestRelaysData,
  successfulRelayData,
  weeklyRelayData,
}) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  const successRate = useMemo(
    () =>
      successfulRelayData.successfulWeeklyRelays /
      weeklyRelayData.weeklyAppRelays,
    [weeklyRelayData, successfulRelayData]
  );

  const { labels: usageLabels = [], lines: usageLines = [] } = useMemo(
    () => formatDailyRelaysForGraphing(dailyRelayData),
    [dailyRelayData]
  );

  return (
    <FloatUp
      content={() => (
        <Split
          primary={
            <>
              <EndpointDetails chainId={appData.chain} appId={appData._id} />
              <Spacer size={2 * GU} />
              <div
                css={`
                  width: 100%;
                  height: ${compactMode ? "auto" : "250px"};
                  display: grid;
                  grid-template-columns: ${compactMode ? "1fr" : "1fr 1fr"};
                  grid-column-gap: ${2 * GU}px;
                `}
              >
                <SuccessRate
                  successRate={successRate}
                  appId={appData._id}
                  totalRequests={weeklyRelayData.weeklyAppRelays}
                />
                <AvgLatency avgLatency={successfulRelayData.avgLatency} />
              </div>
              <Spacer size={2 * GU} />
              <UsageTrends
                chartLabels={usageLabels}
                chartLines={usageLines}
                sessionRelays={avgSessionRelayCount.avgRelaysPerSession}
              />
              <Spacer size={2 * GU} />
              <LatestRequests latestRequests={latestRelaysData.latestRelays} />
            </>
          }
          secondary={
            <>
              <Button
                mode="strong"
                wide
                onClick={() => history.push(`${url}/chains`)}
              >
                Switch chains
              </Button>
              <Spacer size={2 * GU} />
              <Button wide onClick={() => history.push(`${url}/security`)}>
                App Security
              </Button>
              <Spacer size={2 * GU} />
              <Button wide onClick={() => history.push(`${url}/notifications`)}>
                Notifications
              </Button>
              <Spacer size={2 * GU} />
              <AppStatus />
              <Spacer size={2 * GU} />
              <AppDetails />
            </>
          }
        />
      )}
    />
  );
}

function EndpointDetails({ chainId, appId }) {
  const endpoint = `https://${prefixFromChainId(
    chainId
  )}.gateway.pokt.network/v1/${appId}`;

  return (
    <Box title="Endpoint">
      <TextCopy
        value={endpoint}
        css={`
          width: 100%;
        `}
      />
    </Box>
  );
}

function SuccessRate({ appId, successRate, totalRequests }) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const numberProps = useSpring({
    number: Math.min(successRate * 100, 100),
    from: { number: 0 },
  });
  const numberIndicatorProps = useSpring({ height: 4, from: { height: 0 } });

  return (
    <Box
      padding={[0, 0, 0, 0]}
      css={`
        display: flex;
        flex-direction: column;
      `}
    >
      <div
        css={`
          position: relative;
          background: #034200;
          height: ${12 * GU}px;
          border-radius: ${1 * GU}px ${1 * GU}px 0 0;
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <animated.h2
          css={`
            ${textStyle("title1")}
          `}
        >
          {numberProps.number.interpolate((x) => `${x.toFixed(2)}%`)}
        </animated.h2>
        <animated.div
          css={`
            position: absolute;
            bottom: 0;
            width: 100%;
            background: #55b02b;
          `}
          style={numberIndicatorProps}
        />
      </div>
      <div
        css={`
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: ${1 * GU}px ${3 * GU}px ${1 * GU}px ${3 * GU}px;
        `}
      >
        <div
          css={`
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <h3
            css={`
              ${textStyle("title3")}
            `}
          >
            Success Rate
          </h3>
          <div>4%</div>
        </div>
        <Spacer size={1 * GU} />
        <div
          css={`
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <h3
            css={`
              ${textStyle("title4")}
            `}
          >
            Total requests
          </h3>
          <h4
            css={`
              ${textStyle("title3")}
            `}
          >
            {Intl.NumberFormat().format(totalRequests)}
          </h4>
        </div>
      </div>

      <ButtonBase
        css={`
          bottom: 0;
          left: 0;
          width: 100%;
          height: ${5 * GU}px;
          border-top: 2px solid #31a1d2;
          border-radius: 0 0 ${RADIUS}px ${RADIUS}px;
          color: #31a1d2;
        `}
        onClick={() => history.push(`${url}/success-details`)}
      >
        More Details
      </ButtonBase>
    </Box>
  );
}

function AvgLatency({ avgLatency }) {
  return (
    <Box>
      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <h3
          css={`
            ${textStyle("title3")}
          `}
        >
          AVG Latency
        </h3>
        <p>{(avgLatency * 1000).toFixed(0)}ms</p>
      </div>
    </Box>
  );
}

function UsageTrends({ chartLabels, chartLines, sessionRelays }) {
  return (
    <Box>
      <div
        css={`
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: 30% 1fr;
          grid-column-gap: ${1 * GU}px;
        `}
      >
        <div
          css={`
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          `}
        >
          <h3
            css={`
              ${textStyle("title3")}
            `}
          >
            Usage Trends
          </h3>
          <Spacer size={2 * GU} />
          <CircleGraph value={sessionRelays / ONE_MILLION} size={100} />
          <Spacer size={1 * GU} />
          <h4
            css={`
              ${textStyle("title4")}
              text-align: center;
            `}
          >
            {sessionRelays.toFixed(0)}
            <span
              css={`
                display: block;
                ${textStyle("body3")}
              `}
            >
              Relays per session
            </span>
          </h4>
        </div>
        <LineChart
          lines={chartLines}
          label={(i) => chartLabels[i]}
          height={200}
          color={() => "#fafafa"}
          renderCheckpoints
        />
      </div>
    </Box>
  );
}

function LatestRequests({ latestRequests }) {
  return (
    <Box
      title="Request Breakdown"
      css={`
        padding-bottom: ${4 * GU}px;
      `}
    >
      <div
        css={`
          display: flex;
          justify-content: space-between;
          align-items: center;
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
                <TableHeader title="Request type" />
                <TableHeader title="Amount of data" />
              </TableRow>
            </>
          }
        >
          {latestRequests.map(({ bytes, method, result }) => (
            <TableRow>
              <TableCell>{method}</TableCell>
              <TableCell>{bytes}</TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </Box>
  );
}

function AppDetails() {
  return (
    <Box
      css={`
        padding-bottom: ${4 * GU}px;
        div:not(:last-child) {
          margin-bottom: ${2 * GU}px;
        }
      `}
    >
      <div
        css={`
          width: 100%;
          display: flex;
          flex-direction: column;
        `}
      >
        <h3
          css={`
            ${textStyle("body1")};
            margin-bottom: ${2 * GU}px;
          `}
        >
          Gateway ID
        </h3>
        <TextCopy value={APP_ID} />
      </div>
      <div
        css={`
          width: 100%;
          display: flex;
          flex-direction: column;
        `}
      >
        <h3
          css={`
            ${textStyle("body1")};
            margin-bottom: ${2 * GU}px;
          `}
        >
          App Secret
        </h3>
        <TextCopy value={APP_ID} />
      </div>
      <div
        css={`
          width: 100%;
          display: flex;
          flex-direction: column;
        `}
      >
        <h3
          css={`
            ${textStyle("body1")};
            margin-bottom: ${2 * GU}px;
          `}
        >
          App public key
        </h3>
        <TextCopy value={APP_ID} />
      </div>
    </Box>
  );
}
