import React, { useCallback, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
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
  GU,
} from "ui";
import AppStatus from "components/AppStatus/AppStatus";
import Box from "components/Box/Box";
import FloatUp from "components/FloatUp/FloatUp";

export default function SuccessDetails({
  appOnChainData,
  latestRelaysData,
  successfulRelayData,
  weeklyRelayData,
}) {
  const [activeKey, setActiveKey] = useState("successful");
  const history = useHistory();
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  const onSuccessfulClick = useCallback(() => setActiveKey("successful"), []);
  const onFailedClick = useCallback(() => setActiveKey("failed"), []);
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

  console.log(
    successRate,
    latestRelaysData,
    successfulRelayData,
    weeklyRelayData,
    weeklyRelayData.weeklyAppRelays - successfulRelayData.successfulWeeklyRelays
  );

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
                        ${textStyle("title2")}
                      `}
                    >
                      {Intl.NumberFormat().format(
                        weeklyRelayData.weeklyAppRelays
                      )}
                      <span
                        css={`
                          display: block;
                          ${textStyle("title4")}
                        `}
                      >
                        Total requests
                      </span>
                      <span
                        css={`
                          ${textStyle("body3")}
                        `}
                      >
                        during this week
                      </span>
                    </h2>
                  </div>
                  <Inline>
                    <CircleGraph
                      value={Math.min(successRate, 1)}
                      size={12 * GU}
                    />
                    <Spacer size={1 * GU} />
                    <div>
                      <h2
                        css={`
                          ${textStyle("title4")}
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
                          processed requests
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
                    />
                    <Spacer size={1 * GU} />
                    <div>
                      <h2
                        css={`
                          ${textStyle("title4")}
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
                          dropped requests
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
                    active={activeKey === "successful"}
                    onClick={onSuccessfulClick}
                  >
                    Successful requests
                  </Tab>
                  <Tab active={activeKey === "failed"} onClick={onFailedClick}>
                    Failed requests
                  </Tab>
                  <Spacer size={2 * GU} />
                </div>
                <Spacer size={5 * GU} />
                <DataView
                  fields={["Request type", "Bytes transferred", "Result"]}
                  entries={latestRelaysData.latestRelays}
                  renderEntry={({ bytes, method, result }) => {
                    return [<p>{method}</p>, <p>{bytes}B</p>, <p>{result}</p>];
                  }}
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
