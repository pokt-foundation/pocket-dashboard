import React, { useMemo } from 'react'
import { Switch, Route, useParams, useRouteMatch } from 'react-router'
import { useQueries } from 'react-query'
import axios from 'axios'
import 'styled-components/macro'
import { Spacer, textStyle, GU } from 'ui'
import AnimatedLogo from 'components/AnimatedLogo/AnimatedLogo'
import AppInfo from 'views/Dashboard/ApplicationDetail/AppInfo'
import Chains from 'views/Dashboard/ApplicationDetail/Chains'
import Notifications from 'views/Dashboard/ApplicationDetail/Notifications'
import LoadBalancerDetail from "views/Dashboard/ApplicationDetail/LoadBalancerDetail"
import Security from 'views/Dashboard/ApplicationDetail/Security'
import SuccessDetails from 'views/Dashboard/ApplicationDetail/SuccessDetails'
import {
  useActiveApplication,
  useAppOnChainStatus,
  useCurrentSessionRelayCount,
  useDailyRelayCount,
  useLatestLatencyValues,
  usePreviousSuccessfulRelays,
  useSucessfulWeeklyRelays,
  useWeeklyAppRelaysInfo,
} from 'views/Dashboard/application-hooks'
import env from 'environment'
import { useUserApps } from 'contexts/AppsContext'

// Earnifi #1 app
const TEST_APP_PUB_KEY =
  'a3edc0d94701ce5e0692754b519ab125c921c704f11439638834894a5ec5fa53'

export default function AppDetailWrapper() {
  const { appsLoading, userApps } = useUserApps()
  const { appId } = useParams()

  const isLb = useMemo(
    () => userApps.find((app) => appId === app.appId && app?.isLb),
    [appId, userApps]
  )

  const activeApplication = useMemo(
    () => userApps.find((app) => appId === app.appId),
    [appId, userApps]
  )

  if (appsLoading) {
    return <AnimatedLoader />
  }

  return isLb ? (
    <LoadBalancerDetail activeApplication={activeApplication} />
  ) : (
    <ApplicationDetail activeApplication={activeApplication} />
  )
}

function LoadBalancerDetail({ activeApplication }) {
  const { appId } = activeApplication
  const results = useQueries([
    {
      queryKey: 'lb/active-application',
      queryFn: async function getActiveApplication() {
        const path = `${env('BACKEND_URL')}/api/lb/${appId}`

        try {
          const { data } = await axios.get(path, {
            withCredentials: true,
          })

          return data
        } catch (err) {
          console.log(err)
        }
      },
    },
  ])

  console.log(results, 'res')

  return <div>plakata plakata</div>
}

function ApplicationDetail() {
  const { appId } = useParams()
  const { path } = useRouteMatch()
  const { appData, isAppLoading, refetchActiveAppData } = useActiveApplication()
  const { appOnChainData, isAppOnChainLoading } = useAppOnChainStatus(appId)
  const { isWeeklyAppRelaysLoading, weeklyRelaysData } = useWeeklyAppRelaysInfo(
    !env('USE_TEST_APP')
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  )
  const {
    isSuccesfulWeeklyRelaysLoading,
    successfulWeeklyRelaysData,
  } = useSucessfulWeeklyRelays(
    !env('USE_TEST_APP')
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  )
  const { isDailyRelayCountLoading, dailyRelayCountData } = useDailyRelayCount(
    !env('USE_TEST_APP')
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  )
  const {
    isCurrentSessionRelaysLoading,
    currentSessionRelayCount,
  } = useCurrentSessionRelayCount(
    !env('USE_TEST_APP')
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  )
  const { isLatestLatencyLoading, latestLatencyData } = useLatestLatencyValues(
    !env('USE_TEST_APP')
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  )
  const {
    isPreviousSuccessfulRelaysLoading,
    previousSucessfulRelaysData,
  } = usePreviousSuccessfulRelays(
    !env('USE_TEST_APP')
      ? appData?.freeTierApplicationAccount?.publicKey
      : TEST_APP_PUB_KEY
  )

  const appLoading =
    isAppLoading ||
    isAppOnChainLoading ||
    isPreviousSuccessfulRelaysLoading ||
    isWeeklyAppRelaysLoading ||
    isSuccesfulWeeklyRelaysLoading ||
    isDailyRelayCountLoading ||
    isCurrentSessionRelaysLoading ||
    isLatestLatencyLoading

  return appLoading ? (
    <AnimatedLoader />
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
