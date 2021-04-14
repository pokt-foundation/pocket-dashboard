import React from "react";
import { Switch, Route, useParams, useRouteMatch } from "react-router";
import "styled-components/macro";
import { Spacer, textStyle, GU } from "ui";
import AnimatedLogo from "components/AnimatedLogo/AnimatedLogo";
import AppInfo from "views/Dashboard/ApplicationDetail/AppInfo";
import Chains from "views/Dashboard/ApplicationDetail/Chains";
import Notifications from "views/Dashboard/ApplicationDetail/Notifications";
import Security from "views/Dashboard/ApplicationDetail/Security";
import SuccessDetails from "views/Dashboard/ApplicationDetail/SuccessDetails";
import {
  useActiveApplication,
  useAppOnChainStatus,
  useCurrentSessionRelayCount,
  useDailyRelayCount,
  useLatestLatencyValues,
  usePreviousSuccessfulRelays,
  useSucessfulWeeklyRelays,
  useWeeklyAppRelaysInfo,
} from "views/Dashboard/application-hooks";
import env from "environment";

// Ethers.js
const TEST_APP_PUB_KEY =
  "2cf38013f8cbe524db3172ec507967ec551fd14cea8209cf4c9da2a490cecf74";

export default function ApplicationDetail() {
  const { appId } = useParams();
  const { path } = useRouteMatch();
  const {
    appData,
    isAppLoading,
    refetchActiveAppData,
  } = useActiveApplication();
  const { appOnChainData, isAppOnChainLoading } = useAppOnChainStatus(appId);
  const { isWeeklyAppRelaysLoading, weeklyRelaysData } = useWeeklyAppRelaysInfo(
    !env("USE_TEST_APP")
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  );
  const {
    isSuccesfulWeeklyRelaysLoading,
    successfulWeeklyRelaysData,
  } = useSucessfulWeeklyRelays(
    !env("USE_TEST_APP")
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  );
  const { isDailyRelayCountLoading, dailyRelayCountData } = useDailyRelayCount(
    !env("USE_TEST_APP")
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  );
  const {
    isCurrentSessionRelaysLoading,
    currentSessionRelayCount,
  } = useCurrentSessionRelayCount(
    !env("USE_TEST_APP")
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  );
  const { isLatestLatencyLoading, latestLatencyData } = useLatestLatencyValues(
    !env("USE_TEST_APP")
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  );
  const {
    isPreviousSuccessfulRelaysLoading,
    previousSucessfulRelaysData,
  } = usePreviousSuccessfulRelays(
    !env("USE_TEST_APP")
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  );

  const appLoading =
    isAppLoading ||
    isAppOnChainLoading ||
    isPreviousSuccessfulRelaysLoading ||
    isWeeklyAppRelaysLoading ||
    isSuccesfulWeeklyRelaysLoading ||
    isDailyRelayCountLoading ||
    isCurrentSessionRelaysLoading ||
    isLatestLatencyLoading;

  return appLoading ? (
    <div
      css={`
        position: relative;
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
          appOnChainData={appOnChainData}
          currentSessionRelays={currentSessionRelayCount}
          dailyRelayData={dailyRelayCountData}
          previousSuccessfulRelays={previousSucessfulRelaysData}
          successfulRelayData={successfulWeeklyRelaysData}
          weeklyRelayData={weeklyRelaysData}
          latestLatencyData={latestLatencyData}
        />
      </Route>
      <Route path={`${path}/security`}>
        <Security
          appData={appData}
          refetchActiveAppData={refetchActiveAppData}
        />
      </Route>
      <Route path={`${path}/success-details`}>
        <SuccessDetails
          appOnChainData={appOnChainData}
          weeklyRelayData={weeklyRelaysData}
          successfulRelayData={successfulWeeklyRelaysData}
        />
      </Route>
      <Route path={`${path}/notifications`}>
        <Notifications
          appData={appData}
          appOnChainData={appOnChainData}
          dailyRelayData={dailyRelayCountData}
        />
      </Route>
      <Route path={`${path}/chains`}>
        <Chains appData={appData} />
      </Route>
    </Switch>
  );
}
