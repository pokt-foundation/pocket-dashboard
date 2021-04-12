import React, { useCallback, useMemo, useState } from "react";
import { useHistory, useRouteMatch } from "react-router";
import { animated, useSpring } from "react-spring";
import * as dayjs from "dayjs";
import * as dayJsutcPlugin from "dayjs/plugin/utc";
import { useViewport } from "use-viewport";
import "styled-components/macro";
import {
  Banner,
  Button,
  CircleGraph,
  DataView,
  LineChart,
  Spacer,
  Split,
  TextCopy,
  textStyle,
  GU,
  RADIUS,
  ButtonBase,
  useToast,
  Modal,
} from "ui";
import AppStatus from "components/AppStatus/AppStatus";
import Box from "components/Box/Box";
import FloatUp from "components/FloatUp/FloatUp";
import SuccessIndicator from "views/Dashboard/ApplicationDetail/SuccessIndicator";
import { prefixFromChainId } from "lib/chain-utils";
import { norm } from "lib/math-utils";
import { getThresholdsPerStake } from "lib/pocket-utils";

const ONE_MILLION = 1000000;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const HIGHLIGHT_COLORS = [
  "#D27E31",
  "#55B02B",
  "#BB31D2",
  "#31ABD2",
  "#D2CC31",
];

const FALLBACK_COLOR = "#C4C4C4";

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
  const [networkModalVisible, setNetworkModalVisible] = useState(false);
  const [networkDenialModalVisible, setNetworkDenialModalVisible] = useState(
    false
  );
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

  const { staked_tokens: stakedTokens } = appOnChainData;
  const { graphThreshold } = getThresholdsPerStake(stakedTokens);

  const isSwitchable = useMemo(() => {
    dayjs.extend(dayJsutcPlugin);
    const today = dayjs.utc();
    const appCreationDate = dayjs.utc(appData.createdAt);

    const diff = today.diff(appCreationDate, "day");

    return diff >= 7;
  }, [appData]);

  const exceedsMaxRelays = useMemo(() => false, []);

  const onCloseNetworkModal = useCallback(
    () => setNetworkModalVisible(false),
    []
  );
  const onCloseDenialModal = useCallback(
    () => setNetworkDenialModalVisible(false),
    []
  );

  const onOpenModal = useCallback(() => {
    if (!isSwitchable) {
      setNetworkDenialModalVisible(true);
    } else {
      setNetworkModalVisible(true);
    }
  }, [isSwitchable]);

  const onSwitchChains = useCallback(() => {
    history.push(`${url}/chains`);
  }, [history, url]);

  return (
    <FloatUp
      content={() => (
        <>
          <Split
            primary={
              <>
                <EndpointDetails chainId={appData.chain} appId={appData._id} />
                <Spacer size={2 * GU} />
                {exceedsMaxRelays && (
                  <>
                    <Banner
                      mode="error"
                      title="Your application has reached the max limit of relays per day"
                    >
                      You should extend your app relays limit to keep the
                      service according to the demand. Contact our sales team to
                      find the best solution for you and keep your
                      onfrastructure running.
                    </Banner>
                    <Spacer size={2 * GU} />
                  </>
                )}
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
                  threshold={graphThreshold}
                />
                <Spacer size={2 * GU} />
                <LatestRequests
                  latestRequests={latestRelaysData.latestRelays}
                />
              </>
            }
            secondary={
              <>
                <Button mode="strong" wide onClick={onOpenModal}>
                  Switch chains
                </Button>
                <Spacer size={2 * GU} />
                <Button wide onClick={() => history.push(`${url}/security`)}>
                  App Security
                </Button>
                <Spacer size={2 * GU} />
                <Button
                  wide
                  onClick={() => history.push(`${url}/notifications`)}
                >
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
          <SwitchInfoModal
            onClose={onCloseNetworkModal}
            onSwitch={onSwitchChains}
            visible={networkModalVisible}
          />
          <SwitchDenialModal
            onClose={onCloseDenialModal}
            visible={networkDenialModalVisible}
          />
        </>
      )}
    />
  );
}

function SwitchInfoModal({ onClose, onSwitch, visible }) {
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  return (
    <Modal visible={visible} onClose={onClose}>
      <div
        css={`
          max-width: ${87 * GU}px;
        `}
      >
        <Banner
          mode="info"
          title="Free tier applications can only change networks once a week"
        >
          If you have already changed the selected network in the last week you
          won't be able to retake your app until the time is due.
        </Banner>
        <Spacer size={3 * GU} />
        <p
          css={`
            ${!compactMode && `text-align: center;`}
          `}
        >
          Do you want to continue?
        </p>
        <Spacer size={3 * GU} />
        <div
          css={`
            display: flex;
            ${compactMode && `flex-direction: column-reverse;`}
            justify-content: center;
            align-items: center;
            padding-left: ${2 * GU}px;
            padding-right: ${2 * GU}px;
          `}
        >
          <Spacer size={6 * GU} />
          <Button onClick={onClose} wide>
            Cancel
          </Button>
          <Spacer size={6 * GU} />
          <Button mode="strong" wide onClick={onSwitch}>
            Switch chains
          </Button>
          <Spacer size={6 * GU} />
        </div>
        <Spacer size={4 * GU} />
      </div>
    </Modal>
  );
}

function SwitchDenialModal({ onClose, visible }) {
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  return (
    <Modal visible={visible} onClose={onClose}>
      <div
        css={`
          max-width: ${87 * GU}px;
        `}
      >
        <Banner mode="warning" title="You've already switched chains this week">
          Once a week has elapsed you will be able to switch chains again. In
          the interim, we invite you to join our Discord community.
        </Banner>
        <Spacer size={3 * GU} />
        <div
          css={`
            display: flex;
            ${compactMode && `flex-direction: column-reverse;`}
            justify-content: center;
            align-items: center;
            padding-left: ${2 * GU}px;
            padding-right: ${2 * GU}px;
          `}
        >
          <Spacer size={6 * GU} />
          <Button onClick={onClose} wide>
            Cancel
          </Button>
          <Spacer size={6 * GU} />
        </div>
        <Spacer size={4 * GU} />
      </div>
    </Modal>
  );
}

function EndpointDetails({ chainId, appId }) {
  const toast = useToast();
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
        onCopy={() => toast("Endpoint copied to clipboard")}
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

function UsageTrends({ chartLabels, chartLines, sessionRelays, threshold }) {
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
  const { within } = useViewport();
  const [colorsByMethod, countByColor, colorValues] = useMemo(() => {
    const colorsByMethod = new Map();
    const countByColor = new Map();
    let id = 0;

    for (const { method } of latestRequests) {
      if (!colorsByMethod.has(method)) {
        colorsByMethod.set(method, HIGHLIGHT_COLORS[id]);
        if (id < HIGHLIGHT_COLORS.length - 1) {
          id++;
        }
      }

      console.log("setting", colorsByMethod.get(method));

      const methodColor = colorsByMethod.get(method);

      countByColor.has(methodColor)
        ? countByColor.set(methodColor, countByColor.get(methodColor) + 1)
        : countByColor.set(methodColor, 1);
    }

    const colorValues = [...colorsByMethod.values()];

    return [colorsByMethod, countByColor, colorValues];
  }, [latestRequests]);

  const compactMode = within(-1, "medium");

  return (
    <Box
      title="Request Breakdown"
      css={`
        padding-bottom: ${4 * GU}px;
      `}
    >
      <div
        css={`
          display: grid;
          grid-template-columns: ${4 * GU}px 1fr;
        `}
      >
        <div
          css={`
            width: ${1 * GU}px;
            height: 100%;
          `}
        >
          {colorValues.map((val) => {
            console.log(
              "percentage",
              countByColor.get(val) / countByColor.size,
              countByColor.get(val),
              val
            );
            return (
              <div
                css={`
                  background: ${val};
                  width: 100%;
                  height: ${(countByColor.get(val) / latestRequests.length) *
                  100}%;
                  box-shadow: ${val} 0px 2px 8px 0px;
                `}
              />
            );
          })}
        </div>
        <DataView
          mode={compactMode ? "list" : "table"}
          fields={["Request Type", "Data transferred", "Result"]}
          entries={latestRequests}
          renderEntry={({ bytes, method, result }) => {
            return [
              <p>{method}</p>,
              <p>
                <div
                  css={`
                    display: inline-block;
                    width: ${1.5 * GU}px;
                    height: ${1.5 * GU}px;
                    border-radius: 50% 50%;
                    background: ${colorsByMethod.get(method) ?? FALLBACK_COLOR};
                  `}
                />
                &nbsp;{bytes}B
              </p>,
              <p>{result}</p>,
            ];
          }}
        />
      </div>
    </Box>
  );
}

function AppDetails({ id, pubkey, secret }) {
  const toast = useToast();

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
        <TextCopy
          value={id}
          onCopy={() => toast("Gateway ID copied to clipboard")}
        />
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
        <TextCopy
          value={pubkey}
          onCopy={() => toast("App public key copied to clipboard")}
        />
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
            Secret Key
          </h3>
          <TextCopy
            value={secret}
            onCopy={() => toast("Secret key copied to clipboard")}
          />
        </div>
      )}
    </Box>
  );
}
