import React, { useCallback, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import { useViewport } from "use-viewport";
import Styled from "styled-components/macro";
import {
  Button,
  CircleGraph,
  Spacer,
  Split,
  Switch,
  textStyle,
  useTheme,
  GU,
} from "ui";
import Box from "components/Box/Box";
import FloatUp from "components/FloatUp/FloatUp";

const MAX_RELAYS = 1000000;

const DEFAULT_PERCENTAGES = {
  quarter: false,
  half: false,
  threeQuarters: false,
  full: false,
};

export default function Notifications({
  appData,
  weeklyRelayData,
  successfulRelayData,
  dailyRelayData,
  avgSessionRelayCount,
  latestRelaysData,
}) {
  const [chosenPercentages, setChosenPercentages] = useState(
    DEFAULT_PERCENTAGES
  );
  const history = useHistory();
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  const { avgRelaysPerSession } = avgSessionRelayCount;

  const highestDailyAmount = useMemo(
    () =>
      dailyRelayData.reduce(
        (highest, { dailyRelays }) => Math.max(highest, dailyRelays),
        0
      ),
    [dailyRelayData]
  );

  const lowestDailyAmount = useMemo(
    () =>
      dailyRelayData.reduce(
        (lowest, { dailyRelays }) => Math.min(lowest, dailyRelays),
        Number.POSITIVE_INFINITY
      ),
    [dailyRelayData]
  );

  const onChosePercentageChange = useCallback(
    (chosenPercentage) => {
      setChosenPercentages({
        ...chosenPercentages,
        [chosenPercentage]: !chosenPercentages[chosenPercentage],
      });
    },
    [chosenPercentages]
  );

  return (
    <FloatUp
      loading={false}
      content={() => (
        <Split
          primary={
            <>
              <Box>
                <p
                  css={`
                    ${textStyle("body2")}
                  `}
                >
                  Set up your usage alert notifications so you're always aware
                  if you're close to maxing out on your alloted requests.
                </p>
              </Box>
              <Spacer size={2 * GU} />
              <Box>
                <div
                  css={`
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    ${compactMode &&
                    `
                      flex-direction: column;
                      align-items: flex-start;
                    `}
                  `}
                >
                  <h2
                    css={`
                      ${textStyle("title2")}
                    `}
                  >
                    Bandwith usage
                  </h2>
                  {compactMode && <Spacer size={1 * GU} />}
                  <h3>Max relays per day: 1M</h3>
                </div>
                <Spacer size={2 * GU} />
                <Inline>
                  <GraphContainer>
                    <CircleGraph
                      value={avgRelaysPerSession / MAX_RELAYS}
                      size={125}
                    />
                    <Spacer size={2 * GU} />
                    <Stack
                      css={`
                        display: flex;
                        flex-direction: column;
                      `}
                    >
                      <h3
                        css={`
                          ${textStyle("title3")}
                        `}
                      >
                        {Intl.NumberFormat().format(avgRelaysPerSession)} Relays
                        <span
                          css={`
                            display: block;
                            ${textStyle("title4")}
                          `}
                        >
                          Average usage
                        </span>
                      </h3>
                    </Stack>
                  </GraphContainer>
                  <Spacer size={2 * GU} />
                  <GraphContainer>
                    <CircleGraph value={highestDailyAmount / MAX_RELAYS} />
                    <Spacer size={1 * GU} />
                    <Stack
                      css={`
                        display: flex;
                        flex-direction: column;
                      `}
                    >
                      <h3
                        css={`
                          ${textStyle("title4")}
                        `}
                      >
                        {Intl.NumberFormat().format(highestDailyAmount)} Relays
                        <span
                          css={`
                            display: block;
                            ${textStyle("body2")}
                          `}
                        >
                          Max usage
                        </span>
                      </h3>
                    </Stack>
                  </GraphContainer>
                  <Spacer size={2 * GU} />
                  <GraphContainer>
                    <CircleGraph value={lowestDailyAmount / MAX_RELAYS} />
                    <Spacer size={1 * GU} />
                    <Stack
                      css={`
                        display: flex;
                        flex-direction: column;
                      `}
                    >
                      <h3
                        css={`
                          ${textStyle("title4")}
                        `}
                      >
                        {Intl.NumberFormat().format(lowestDailyAmount)} Relays
                        <span
                          css={`
                            display: block;
                            ${textStyle("body2")}
                          `}
                        >
                          Min usage
                        </span>
                      </h3>
                    </Stack>
                  </GraphContainer>
                </Inline>
                <Spacer size={2 * GU} />
                <p
                  css={`
                    ${textStyle("body4")}
                  `}
                >
                  These values are calculated on a period of 7 days.
                </p>
              </Box>
            </>
          }
          secondary={
            <>
              <Button wide mode="strong" onClick={() => history.goBack()}>
                Save changes
              </Button>
              <Spacer size={2 * GU} />
              <Button wide onClick={() => history.goBack()}>
                Back to application
              </Button>
              <Spacer size={2 * GU} />
              <Box title="Notification preferences">
                <p
                  css={`
                    ${textStyle("body2")}
                  `}
                >
                  Whenever an app reaches one of the bandwith thresholds defined
                  below, we'll send an email notifying you about it.
                </p>
              </Box>
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="quarter"
                checked={chosenPercentages.quarter}
                onChange={() => onChosePercentageChange("quarter")}
              />
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="half"
                checked={chosenPercentages.half}
                onChange={() => onChosePercentageChange("half")}
              />
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="threeQuarters"
                checked={chosenPercentages.threeQuarters}
                onChange={() => onChosePercentageChange("threeQuarters")}
              />
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="full"
                checked={chosenPercentages.full}
                onChange={() => onChosePercentageChange("full")}
              />
            </>
          }
        />
      )}
    />
  );
}

function NotificationPreference({ level, checked, onChange }) {
  const theme = useTheme();

  const backgroundColor = useMemo(() => {
    if (level === "quarter") {
      return theme.positive;
    } else if (level === "half") {
      return theme.yellow;
    } else if (level === "threeQuarters") {
      return theme.warning;
    } else {
      return theme.negative;
    }
  }, [level, theme]);

  const usagePercentage = useMemo(() => {
    if (level === "quarter") {
      return "25%";
    } else if (level === "half") {
      return "50%";
    } else if (level === "threeQuarters") {
      return "75%";
    } else {
      return "100%";
    }
  }, [level]);

  return (
    <Box padding={[2 * GU, 2 * GU, 2 * GU, 4 * GU]}>
      <div
        css={`
          position: absolute;
          left: 0;
          top: 0;
          width: ${2 * GU}px;
          height: 100%;
          background: ${backgroundColor};
          border-radius: ${1 * GU}px 0px 0px ${1 * GU}px;
        `}
      />
      <div
        css={`
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
          {usagePercentage}&nbsp;
          <span
            css={`
              ${textStyle("body3")}
            `}
          >
            of 1M relays
          </span>
        </h3>
        <Switch checked={checked} onChange={onChange} />
      </div>
    </Box>
  );
}

function Inline({ children }) {
  const { within } = useViewport();
  const compactMode = within(-1, "medium");

  return (
    <div
      css={`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        ${compactMode &&
        `
          flex-direction: column;
          align-items: flex-start;
        `}
      `}
    >
      {children}
    </div>
  );
}

const GraphContainer = Styled.div`
  display: flex;
  flex-direction: column;
`;

const Stack = Styled.div`
  display: flex;
  flex-direction: column;
`;
