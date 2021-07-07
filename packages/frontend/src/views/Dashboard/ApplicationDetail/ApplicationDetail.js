import React, { useMemo } from 'react'
import { Switch, Route, useParams, useRouteMatch } from 'react-router'
import 'styled-components/macro'
import { Spacer, textStyle, GU } from '@pokt-foundation/ui'
import AnimatedLogo from 'components/AnimatedLogo/AnimatedLogo'
import AppInfo from 'views/Dashboard/ApplicationDetail/AppInfo'
import Chains from 'views/Dashboard/ApplicationDetail/Chains'
import Notifications from 'views/Dashboard/ApplicationDetail/Notifications'
import Security from 'views/Dashboard/ApplicationDetail/Security'
import SuccessDetails from 'views/Dashboard/ApplicationDetail/SuccessDetails'
import { useAppMetrics } from 'hooks/useAppMetrics'
import { useUserApps } from 'contexts/AppsContext'

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
    { data: dailyRelayData },
    { data: sessionRelayData },
    { data: previousSuccessfulRelayData },
    { data: previousRangedRelayData },
    { data: hourlyLatencyData },
    { data: appOnChainData },
  ] = metrics

  const sessionRelayDep = JSON.stringify(sessionRelayData)
  const dailyRelaysDep = JSON.stringify(dailyRelayData)
  const previousSuccessfulRelaysDep = JSON.stringify(
    previousSuccessfulRelayData
  )
  const previousRangedRelaysDep = JSON.stringify(previousRangedRelayData)
  const hourlyLatencyDep = JSON.stringify(hourlyLatencyData)
  const appOnChainDep = JSON.stringify(appOnChainData)

  const currentSessionRelays = useMemo(
    () => sessionRelayData?.session_relays ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionRelayDep]
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dailyRelays = useMemo(() => dailyRelayData?.daily_relays ?? 0, [
    dailyRelaysDep,
  ])
  const previousSuccessfulRelays = useMemo(
    () => previousSuccessfulRelayData?.successful_relays ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previousSuccessfulRelaysDep]
  )
  const previousRangedRelays = useMemo(
    () => previousRangedRelayData?.total_relays ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [previousRangedRelaysDep]
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const hourlyLatency = useMemo(() => hourlyLatencyData?.hourly_latency ?? [], [
    hourlyLatencyDep,
  ])
  const { stakedTokens, maxDailyRelays } = useMemo(() => {
    return {
      stakedTokens: appOnChainData?.stake ?? 0n,
      maxDailyRelays: appOnChainData?.relays * 24 ?? 0n,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appOnChainDep])

  return metricsLoading ? (
    <AnimatedLoader />
  ) : (
    <Switch>
      <Route exact path={path}>
        <AppInfo
          appData={activeApplication}
          currentSessionRelays={currentSessionRelays}
          dailyRelayData={dailyRelays}
          maxDailyRelays={maxDailyRelays}
          previousSuccessfulRelays={previousSuccessfulRelays}
          previousRelays={previousRangedRelays}
          stakedTokens={stakedTokens}
          successfulRelayData={successfulRelays}
          weeklyRelayData={totalRelays}
          latestLatencyData={hourlyLatency}
        />
      </Route>
      <Route path={`${path}/security`}>
        <Security
          appData={activeApplication}
          maxDailyRelays={maxDailyRelays}
          refetchActiveAppData={refetchActiveAppData}
          stakedTokens={stakedTokens}
        />
      </Route>
      <Route path={`${path}/success-details`}>
        <SuccessDetails
          id={activeApplication.id}
          isLb={activeApplication.isLb}
          maxDailyRelays={maxDailyRelays}
          stakedTokens={stakedTokens}
          successfulRelayData={successfulRelays}
          weeklyRelayData={totalRelays}
        />
      </Route>
      <Route path={`${path}/notifications`}>
        <Notifications
          appData={activeApplication}
          dailyRelays={dailyRelays}
          maxDailyRelays={maxDailyRelays}
          stakedTokens={stakedTokens}
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
        height: 70vh;
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
