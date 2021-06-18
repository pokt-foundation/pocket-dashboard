import React, { useMemo } from 'react'
import { Switch, Route, useParams, useRouteMatch } from 'react-router'
import 'styled-components/macro'
import { Spacer, textStyle, GU } from 'ui'
import AnimatedLogo from 'components/AnimatedLogo/AnimatedLogo'
import AppInfo from 'views/Dashboard/ApplicationDetail/AppInfo'
import Chains from 'views/Dashboard/ApplicationDetail/Chains'
import Notifications from 'views/Dashboard/ApplicationDetail/Notifications'
import Security from 'views/Dashboard/ApplicationDetail/Security'
import SuccessDetails from 'views/Dashboard/ApplicationDetail/SuccessDetails'
import { useAppMetrics } from 'views/Dashboard/ApplicationDetail/useAppMetrics'
import env from 'environment'
import { useUserApps } from 'contexts/AppsContext'

const appOnChainStatus = {
  status: 'Staked',
  staked_tokens: 24950100000,
}

export default function AppDetailWrapper() {
  const { appsLoading, refetchApps, userApps } = useUserApps()
  const { appId } = useParams()

  const activeApplication = useMemo(
    () => userApps.find((app) => appId === app.id),
    [appId, userApps]
  )

  if (appsLoading || !activeApplication) {
    return <AnimatedLoader />
  }

  return (
    <ApplicationDetail
      activeApplication={activeApplication}
      refetchActiveAppData={refetchApps}
    />
  )
}

function ApplicationDetail({ activeApplication, refetchActiveAppData }) {
  const { path } = useRouteMatch()
  const { metricsLoading, metrics } = useAppMetrics({
    activeApplication,
  })
  const [
    { data: totalRelays },
    { data: successfulRelays },
    { data: dailyRelays },
    { data: sessionRelays },
    { data: previousSuccessfulRelays },
    { data: previousRangedRelays },
    { data: hourlyLatency },
    { data: appOnChainData },
  ] = metrics

  return metricsLoading ? (
    <AnimatedLoader />
  ) : (
    <Switch>
      <Route exact path={path}>
        <AppInfo
          appData={activeApplication}
          appOnChainData={appOnChainStatus}
          currentSessionRelays={sessionRelays.session_relays}
          dailyRelayData={dailyRelays.daily_relays}
          previousSuccessfulRelays={previousSuccessfulRelays.successful_relays}
          previousRelays={previousRangedRelays.total_relays}
          successfulRelayData={successfulRelays}
          weeklyRelayData={totalRelays}
          latestLatencyData={hourlyLatency.hourly_latency}
        />
      </Route>
      <Route path={`${path}/security`}>
        <Security
          appData={activeApplication}
          refetchActiveAppData={refetchActiveAppData}
        />
      </Route>
      <Route path={`${path}/success-details`}>
        <SuccessDetails
          id={activeApplication.id}
          isLb={activeApplication.isLb}
          appOnChainData={appOnChainStatus}
          weeklyRelayData={totalRelays}
          successfulRelayData={successfulRelays}
        />
      </Route>
      <Route path={`${path}/notifications`}>
        <Notifications
          appData={activeApplication}
          appOnChainData={appOnChainStatus}
          dailyRelayData={dailyRelays.daily_relays}
        />
      </Route>
      <Route path={`${path}/chains`}>
        <Chains appData={activeApplication} />
      </Route>
    </Switch>
  )
}

function AnimatedLoader() {
  return (
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
          ${textStyle('body2')}
        `}
      >
        Loading application...
      </p>
    </div>
  )
}
