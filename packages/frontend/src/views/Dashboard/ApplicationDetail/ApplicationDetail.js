import React from "react";
import { Switch, Route, useRouteMatch } from "react-router";
import "styled-components/macro";
import { Spacer, textStyle, GU } from "ui";
import AnimatedLogo from "components/AnimatedLogo/AnimatedLogo";
import AppInfo from "views/Dashboard/ApplicationDetail/AppInfo";
import Notifications from "views/Dashboard/ApplicationDetail/Notifications";
import Security from "views/Dashboard/ApplicationDetail/Security";
import SuccessDetails from "views/Dashboard/ApplicationDetail/SuccessDetails";
import {
  useActiveApplication,
  useAvgSessionRelayCount,
  useDailyRelayCount,
  useLatestRelays,
  useSucessfulWeeklyRelays,
  useWeeklyAppRelaysInfo,
} from "views/Dashboard/application-hooks";

export default function ApplicationDetail() {
  const { path } = useRouteMatch();
  const { appData, isAppLoading } = useActiveApplication();
  const { isWeeklyAppRelaysLoading, weeklyRelaysData } = useWeeklyAppRelaysInfo(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of ethers's apps for testing
    "2cf38013f8cbe524db3172ec507967ec551fd14cea8209cf4c9da2a490cecf74"
  );
  const {
    isSuccesfulWeeklyRelaysLoading,
    successfulWeeklyRelaysData,
  } = useSucessfulWeeklyRelays(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of ethers's apps for testing
    "2cf38013f8cbe524db3172ec507967ec551fd14cea8209cf4c9da2a490cecf74"
  );
  const { isDailyRelayCountLoading, dailyRelayCountData } = useDailyRelayCount(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of ethers's apps for testing
    "2cf38013f8cbe524db3172ec507967ec551fd14cea8209cf4c9da2a490cecf74"
  );
  const {
    isAvgSessionRelayCountLoading,
    avgSessionRelayCount,
  } = useAvgSessionRelayCount(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of ethers's apps for testing
    "2cf38013f8cbe524db3172ec507967ec551fd14cea8209cf4c9da2a490cecf74"
  );
  const { isLatestRelaysLoading, latestRelayData } = useLatestRelays(
    // appData?.freeTierApplicationAccount?.publicKey
    // One of ethers's apps for testing
    "2cf38013f8cbe524db3172ec507967ec551fd14cea8209cf4c9da2a490cecf74",
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
        /* TODO: This is leaky. fix up with a permanent component */
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
    <Switch>
      <Route exact path={path}>
        <AppInfo
          appData={appData}
          weeklyRelayData={weeklyRelaysData}
          successfulRelayData={successfulWeeklyRelaysData}
          dailyRelayData={dailyRelayCountData}
          avgSessionRelayCount={avgSessionRelayCount}
          latestRelaysData={latestRelayData}
        />
      </Route>
      <Route path={`${path}/security`}>
        <Security
          appData={appData}
          weeklyRelayData={weeklyRelaysData}
          successfulRelayData={successfulWeeklyRelaysData}
          dailyRelayData={dailyRelayCountData}
          avgSessionRelayCount={avgSessionRelayCount}
          latestRelaysData={latestRelayData}
        />
      </Route>
      <Route path={`${path}/success-details`}>
        <SuccessDetails
          appData={appData}
          weeklyRelayData={weeklyRelaysData}
          successfulRelayData={successfulWeeklyRelaysData}
          dailyRelayData={dailyRelayCountData}
          avgSessionRelayCount={avgSessionRelayCount}
          latestRelaysData={latestRelayData}
        />
      </Route>
      <Route path={`${path}/notifications`}>
        <Notifications
          appData={appData}
          weeklyRelayData={weeklyRelaysData}
          successfulRelayData={successfulWeeklyRelaysData}
          dailyRelayData={dailyRelayCountData}
          avgSessionRelayCount={avgSessionRelayCount}
          latestRelaysData={latestRelayData}
        />
      </Route>
      <Route path={`${path}/chains`}>
        <h1>Chains</h1>
      </Route>
    </Switch>
  );
}
