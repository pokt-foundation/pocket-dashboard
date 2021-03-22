import React from "react";
import "styled-components/macro";
import { Spacer, textStyle, GU } from "ui";
import AnimatedLogo from "components/AnimatedLogo/AnimatedLogo";
import AppInfo from "views/Dashboard/ApplicationDetail/AppInfo";
import {
  useActiveApplication,
  useAvgSessionRelayCount,
  useDailyRelayCount,
  useLatestRelays,
  useSucessfulWeeklyRelays,
  useWeeklyAppRelaysInfo,
} from "views/Dashboard/application-hooks";

export default function ApplicationDetail() {
  const { appData, isAppLoading } = useActiveApplication();
  const { isWeeklyAppRelaysLoading, weeklyRelaysData } = useWeeklyAppRelaysInfo(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of Zapper.fi's apps for testing
    "1b74bc3a4f61583159ca9a4702687d68bb478321f278e08e686db318befca21a"
  );
  const {
    isSuccesfulWeeklyRelaysLoading,
    successfulWeeklyRelaysData,
  } = useSucessfulWeeklyRelays(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of Zapper.fi's apps for testing
    "1b74bc3a4f61583159ca9a4702687d68bb478321f278e08e686db318befca21a"
  );
  const { isDailyRelayCountLoading, dailyRelayCountData } = useDailyRelayCount(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of Zapper.fi's apps for testing
    "1b74bc3a4f61583159ca9a4702687d68bb478321f278e08e686db318befca21a"
  );
  const {
    isAvgSessionRelayCountLoading,
    avgSessionRelayCount,
  } = useAvgSessionRelayCount(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of Zapper.fi's apps for testing
    "1b74bc3a4f61583159ca9a4702687d68bb478321f278e08e686db318befca21a"
  );
  const { isLatestRelaysLoading, latestRelayData } = useLatestRelays(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of Zapper.fi's apps for testing
    "1b74bc3a4f61583159ca9a4702687d68bb478321f278e08e686db318befca21a",
    0
  );

  const appLoading =
    isAppLoading ||
    isWeeklyAppRelaysLoading ||
    isSuccesfulWeeklyRelaysLoading ||
    isDailyRelayCountLoading ||
    isAvgSessionRelayCountLoading ||
    isLatestRelaysLoading;

  return appLoading ? (
    <div
      css={`
        width: 100%;
        /* TODO: This is leaky. remove */
        height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      <AnimatedLogo />
      <Spacer size={2 * GU} />
      <p
        css={`
          ${textStyle("body2")}
        `}
      >
        Loading application...
      </p>
    </div>
  ) : (
    <AppInfo
      appData={appData}
      weeklyRelayData={weeklyRelaysData}
      successfulRelayData={successfulWeeklyRelaysData}
      dailyRelayData={dailyRelayCountData}
      avgSessionRelayCount={avgSessionRelayCount}
      latestRelaysData={latestRelayData}
    />
  );
}
