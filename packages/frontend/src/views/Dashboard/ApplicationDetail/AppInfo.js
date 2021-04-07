import React, { useMemo } from "react";
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
import SuccessIndicator from "views/Dashboard/ApplicationDetail/SuccessIndicator";
import { prefixFromChainId } from "lib/chain-utils";
import { norm } from "lib/math-utils";

const ONE_MILLION = 1000000;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDailyRelaysForGraphing(dailyRelays = []) {
  const labels = dailyRelays
    .map(({ bucket }) => bucket.split("T")[0])
    .map((bucket) => DAYS[new Date(bucket).getUTCDay()]);

  const lines = [
    {
      id: 1,
      values: dailyRelays.map(({ dailyRelays }) =>
        norm(dailyRelays, 0, ONE_MILLION)
      ),
    },
  ];

  return {
    labels,
    lines,
  };
}

export default function AppInfo({
  appData,
  appOnChainData,
  currentSessionRelays,
  dailyRelayData,
  latestRelaysData,
  previousSuccessfulRelays,
  successfulRelayData,
  weeklyRelayData,
}) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  const successRate = useMemo(() => {
    return weeklyRelayData.weeklyAppRelays === 0
      ? 0
      : successfulRelayData.successfulWeeklyRelays /
          weeklyRelayData.weeklyAppRelays;
  }, [weeklyRelayData, successfulRelayData]);
  const previousSuccessRate = useMemo(() => {
    return previousSuccessfulRelays.previousTotalRelays === 0
      ? 0
      : previousSuccessfulRelays.successfulWeeklyRelays /
          previousSuccessfulRelays.previousTotalRelays;
  }, [previousSuccessfulRelays]);

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
                  appId={appData._id}
                  previousSuccessRate={previousSuccessRate}
                  successRate={successRate}
                  totalRequests={weeklyRelayData.weeklyAppRelays}
                />
                <AvgLatency avgLatency={successfulRelayData.avgLatency} />
              </div>
              <Spacer size={2 * GU} />
              <UsageTrends
                chartLabels={usageLabels}
                chartLines={usageLines}
                sessionRelays={currentSessionRelays}
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
              <AppStatus appOnChainStatus={appOnChainData} />
              <Spacer size={2 * GU} />
              <AppDetails
                id={appData._id}
                pubkey={appData.freeTierApplicationAccount.publicKey}
                secret={appData.gatewaySettings?.secretKey ?? ""}
              />
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

function SuccessRate({ previousSuccessRate = 0, successRate, totalRequests }) {
  const history = useHistory();
  const { url } = useRouteMatch();
  const numberProps = useSpring({
    number: Math.min(successRate * 100, 100),
    from: { number: 0 },
  });
  const numberIndicatorProps = useSpring({ height: 4, from: { height: 0 } });
  const successRateDelta = useMemo(
    () => (((successRate - previousSuccessRate) / 1) * 100).toFixed(2),
    [previousSuccessRate, successRate]
  );

  const mode = successRateDelta > 0 ? "positive" : "negative";

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
          <div
            css={`
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            `}
          >
            <div
              css={`
                display: flex;
                align-items: center;
              `}
            >
              {totalRequests ? <SuccessIndicator mode={mode} /> : ""}
              <Spacer size={GU / 2} />
              <span>{Math.abs(successRateDelta)}%</span>
            </div>
            <p
              css={`
                ${textStyle("body4")}
              `}
            >
              Last 7 days
            </p>
          </div>
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
  const isChartLinesEmpty = useMemo(() => chartLines[0].values.length === 0, [
    chartLines,
  ]);

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
              Relays this session
            </span>
          </h4>
        </div>
        {isChartLinesEmpty ? (
          <div
            css={`
              display: flex;
              justify-content: center;
              align-items: center;
            `}
          >
            <h3
              css={`
                ${textStyle("body3")}
              `}
            >
              No data to show.
            </h3>
          </div>
        ) : (
          <LineChart
            lines={chartLines}
            label={(i) => chartLabels[i]}
            height={200}
            color={() => "#31A1D2"}
            renderCheckpoints
          />
        )}
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
                <TableHeader title="Result" />
              </TableRow>
            </>
          }
        >
          {latestRequests.map(({ bytes, method, result }, index) => (
            <TableRow key={index}>
              <TableCell>{method}</TableCell>
              <TableCell>{bytes}</TableCell>
              <TableCell>{result}</TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </Box>
  );
}

function AppDetails({ id, pubkey, secret }) {
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
        <TextCopy value={id} />
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
        <TextCopy value={pubkey} />
      </div>
      {secret && (
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
          <TextCopy value={secret} />
        </div>
      )}
    </Box>
  );
}
