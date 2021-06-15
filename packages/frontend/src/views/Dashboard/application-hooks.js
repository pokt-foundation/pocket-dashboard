import axios from 'axios'
import * as dayjs from 'dayjs'
import * as dayJsutcPlugin from 'dayjs/plugin/utc'
import { GraphQLClient, gql } from 'graphql-request'
import { useParams } from 'react-router'
import { useQuery } from 'react-query'
import env from 'environment'

const BUCKETS_PER_HOUR = 2
const OFFSET = 10

const gqlClient = new GraphQLClient(env('HASURA_URL'), {
  headers: {
    'x-hasura-admin-secret': env('HASURA_SECRET'),
  },
})

const TOTAL_RELAYS_AND_AVG_LATENCY_QUERY = gql`
  query TOTAL_RELAYS_AND_AVG_LATENCY_QUERY($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`

const TOTAL_RANGED_RELAYS_QUERY = gql`
  query TOTAL_RANGED_RELAYS_QUERY(
    $_eq: String
    $_gte: timestamptz
    $_lte: timestamptz
  ) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte, _lte: $_lte }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`

const WEEKLY_SUCCESSFUL_RELAYS_QUERY = gql`
  query SUCCESSFUL_WEEKLY_RELAYS($_eq: String, $_gte: timestamptz) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        result: { _eq: "200" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
        avg {
          elapsed_time
        }
      }
    }
  }
`

const WEEKLY_RANGED_SUCCESSFUL_RELAYS = gql`
  query SUCCESSFUL_WEEKLY_RELAYS(
    $_eq: String
    $_gte: timestamptz
    $_lte: timestamptz
  ) {
    relay_apps_daily_aggregate(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte, _lte: $_lte }
        result: { _eq: "200" }
      }
      order_by: { bucket: desc }
    ) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`

const DAILY_APP_RELAYS_QUERY = gql`
  query DAILY_RELAYS_QUERY($_eq: String, $_gte: timestamptz) {
    relay_apps_daily(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
    ) {
      bucket
      total_relays
    }
  }
`

const LAST_SESSION_RELAYS_QUERY = gql`
  query LAST_SESSION_RELAYS($_eq: String, $_gte: timestamptz) {
    relay_app_hourly(
      where: { app_pub_key: { _eq: $_eq }, bucket: { _gte: $_gte } }
      order_by: { bucket: desc }
      limit: ${BUCKETS_PER_HOUR} 
    ) {
      bucket
      total_relays
    }
  }
`

const LATEST_RELAYS_QUERY = gql`
  query LATEST_RELAYS($_eq: String, $limit: Int, $offset: Int) {
    relay(
      limit: $limit
      offset: $offset
      order_by: { timestamp: desc }
      where: { app_pub_key: { _eq: $_eq } }
    ) {
      service_node
      method
      result
      bytes
      timestamp
      elapsed_time
    }
  }
`

const LATEST_LATENCY_VALUES_QUERY = gql`
  query TOTAL_RELAYS_AND_AVG_LATENCY_QUERY($_eq: String, $_gte: timestamptz) {
    relay_app_hourly(
      where: {
        app_pub_key: { _eq: $_eq }
        bucket: { _gte: $_gte }
        elapsed_time: { _lte: "2" }
      }
      order_by: { bucket: desc }
    ) {
      elapsed_time
      bucket
    }
  }
`

export function useUserApplications() {
  const {
    isLoading: isAppsLoading,
    isError: isAppsError,
    data: appsData,
    refetch: refetchUserApps,
  } = useQuery('user/applications', async function getUserApplications() {
    const path = `${env('BACKEND_URL')}/api/applications`

    try {
      const { data } = await axios.get(path, {
        withCredentials: true,
      })

      const userApps = data.map(({ name, _id, ...rest }) => ({
        appName: name,
        appId: _id,
        ...rest,
      }))

      return userApps
    } catch (err) {
      // TODO: Send to sentry
      console.log(err, 'rip')
    }
  })

  return {
    appsData,
    isAppsError,
    isAppsLoading,
    refetchUserApps,
  }
}

export function useUserLoadBalancers() {
  const {
    isLoading: isLbLoading,
    isError: isLbError,
    data: lbData,
    refetch: refetchUserApps,
  } = useQuery('user/lbs', async function getUserLoadBalancers() {
    const path = `${env('BACKEND_URL')}/api/lb`

    try {
      const { data } = await axios.get(path, {
        withCredentials: true,
      })

      const userApps = data.map(({ name, _id, ...rest }) => ({
        appName: name,
        appId: _id,
        isLb: true,
        ...rest,
      }))

      return userApps
    } catch (err) {
      // TODO: Send to sentry
      console.log(err, 'rip')
    }
  })

  return {
    lbData,
    isLbError,
    isLbLoading,
    refetchUserApps,
  }
}

export function useActiveApplication() {
  const { appId } = useParams()

  const {
    isLoading: isAppLoading,
    isError: isAppError,
    data: appData,
    refetch: refetchActiveAppData,
  } = useQuery(
    `user/applications/${appId ?? 'NO_APPLICATION'}`,
    async function getActiveApplication() {
      if (!appId) {
        return null
      }

      const path = `${env('BACKEND_URL')}/api/applications/${appId}`

      try {
        const { data } = await axios.get(path, {
          withCredentials: true,
        })

        return data
      } catch (err) {
        console.log(err)
      }
    }
  )

  return {
    appData,
    isAppError,
    isAppLoading,
    refetchActiveAppData,
  }
}

export function useWeeklyAppRelaysInfo(appPubKey = '') {
  const {
    isLoading: isWeeklyAppRelaysLoading,
    isError: isWeeklyAppRelaysError,
    data: weeklyRelaysData,
  } = useQuery(
    `user/applications/${appPubKey}/weekly-relays-avg-latency`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null
      }

      dayjs.extend(dayJsutcPlugin)

      const sevenDaysAgo = dayjs.utc().subtract(7, 'day')

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`

      try {
        const res = await gqlClient.request(
          TOTAL_RELAYS_AND_AVG_LATENCY_QUERY,
          {
            _eq: appPubKey,
            _gte: formattedTimestamp,
          }
        )

        const {
          relay_apps_daily_aggregate: {
            aggregate: {
              avg: { elapsed_time: avgLatency },
              sum: { total_relays: weeklyAppRelays },
            },
          },
        } = res

        return {
          avgLatency: avgLatency ?? 0,
          weeklyAppRelays: weeklyAppRelays ?? 0,
        }
      } catch (err) {
        console.log(err, 'rip')
      }
    }
  )

  return {
    isWeeklyAppRelaysError,
    isWeeklyAppRelaysLoading,
    weeklyRelaysData,
  }
}

export function useSucessfulWeeklyRelays(appPubKey) {
  const {
    isLoading: isSuccesfulWeeklyRelaysLoading,
    isError: isSuccessfulWeeklyRelaysError,
    data: successfulWeeklyRelaysData,
  } = useQuery(
    `user/applications/${appPubKey}/sucessful-weekly-relays`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null
      }

      dayjs.extend(dayJsutcPlugin)

      const sevenDaysAgo = dayjs.utc().subtract(7, 'day')

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`

      try {
        const res = await gqlClient.request(WEEKLY_SUCCESSFUL_RELAYS_QUERY, {
          _eq: appPubKey,
          _gte: formattedTimestamp,
        })

        const {
          relay_apps_daily_aggregate: {
            aggregate: {
              avg: { elapsed_time: avgLatency },
              sum: { total_relays: successfulWeeklyRelays },
            },
          },
        } = res

        return {
          avgLatency: avgLatency ?? 0,
          successfulWeeklyRelays: successfulWeeklyRelays ?? 0,
        }
      } catch (err) {
        console.log(err, 'rip')
      }
    }
  )

  return {
    isSuccesfulWeeklyRelaysLoading,
    isSuccessfulWeeklyRelaysError,
    successfulWeeklyRelaysData,
  }
}

export function useDailyRelayCount(appPubKey) {
  const {
    isError: isDailyRelayCountError,
    isLoading: isDailyRelayCountLoading,
    data: dailyRelayCountData,
  } = useQuery(
    `user/applications/${appPubKey}/daily-app-count`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null
      }

      dayjs.extend(dayJsutcPlugin)

      const sevenDaysAgo = dayjs.utc().subtract(7, 'day')

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`

      try {
        const res = await gqlClient.request(DAILY_APP_RELAYS_QUERY, {
          _eq: appPubKey,
          _gte: formattedTimestamp,
        })

        const { relay_apps_daily: rawDailyRelays = [] } = res

        const dailyRelays = new Map()

        for (const {
          bucket,
          total_relays: dailyRelayCount,
        } of rawDailyRelays) {
          if (!dailyRelays.has(bucket)) {
            dailyRelays.set(bucket, dailyRelayCount)
          } else {
            const currentCount = dailyRelays.get(bucket)

            dailyRelays.set(
              bucket,
              Number(currentCount) + Number(dailyRelayCount)
            )
          }
        }

        const processedDailyRelays = []

        for (const [bucket, dailyRelayCount] of dailyRelays.entries()) {
          processedDailyRelays.push({ bucket, dailyRelays: dailyRelayCount })
        }

        return processedDailyRelays.reverse()
      } catch (err) {
        console.log(err, 'rip')
      }
    }
  )

  return {
    isDailyRelayCountError,
    isDailyRelayCountLoading,
    dailyRelayCountData,
  }
}

export function useCurrentSessionRelayCount(appPubKey) {
  const {
    isLoading: isCurrentSessionRelaysLoading,
    isError: isCurrentSessionRelaysError,
    data: currentSessionRelayCount,
  } = useQuery(
    `user/applications/${appPubKey}/avg-session-count`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null
      }

      dayjs.extend(dayJsutcPlugin)

      const today = dayjs.utc()

      const formattedTimestamp = `${today.year()}-0${
        today.month() + 1
      }-${today.date()}T00:00:00+00:00`

      try {
        const res = await gqlClient.request(LAST_SESSION_RELAYS_QUERY, {
          _eq: appPubKey,
          _gte: formattedTimestamp,
        })
        const { relay_app_hourly: hourlyRelays } = res

        const totalSessionRelays = hourlyRelays.reduce(
          (total, { total_relays: totalRelays }) => total + totalRelays,
          0
        )

        return totalSessionRelays ?? 0
      } catch (err) {
        console.log(err, 'rip')
      }
    }
  )

  return {
    isCurrentSessionRelaysLoading,
    isCurrentSessionRelaysError,
    currentSessionRelayCount,
  }
}

export function useLatestRelays(appPubKey, page = 0, limit = 10) {
  const {
    isLoading: isLatestRelaysLoading,
    isError: isLatestRelaysError,
    data: latestRelayData,
  } = useQuery(
    [`user/applications/${appPubKey}/latest-relays`, page],
    async function getLatestRelays() {
      if (!appPubKey) {
        return null
      }

      try {
        const res = await gqlClient.request(LATEST_RELAYS_QUERY, {
          _eq: appPubKey,
          limit,
          offset: page * OFFSET,
        })

        const { relay: latestRelays } = res

        return { latestRelays: latestRelays ?? [] }
      } catch (err) {
        console.log(err, 'rip')
      }
    },
    {
      keepPreviousData: true,
    }
  )

  return {
    isLatestRelaysLoading,
    isLatestRelaysError,
    latestRelayData,
  }
}

export function useAppOnChainStatus(appId) {
  const {
    isLoading: isAppOnChainLoading,
    isError: isAppOnChainError,
    data: appOnChainData,
  } = useQuery(
    `user/applications/${appId}/onchaindata`,
    async function getOnChainAppData() {
      if (!appId) {
        return null
      }

      const path = `${env('BACKEND_URL')}/api/applications/status/${appId}`

      try {
        const { data } = await axios.get(path, {
          withCredentials: true,
        })

        return data
      } catch (err) {
        console.log(Object.entries(err), 'rip')
      }
    }
  )

  return {
    appOnChainData,
    isAppOnChainError,
    isAppOnChainLoading,
  }
}

export function usePreviousSuccessfulRelays(appPubKey) {
  const {
    isLoading: isPreviousSuccessfulRelaysLoading,
    isError: isPreviousSuccessfulRelaysError,
    data: previousSucessfulRelaysData,
  } = useQuery(
    `user/applications/${appPubKey}/sucessful-ranged-weekly-relays`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null
      }

      dayjs.extend(dayJsutcPlugin)

      const fourteenDaysAgo = dayjs.utc().subtract(14, 'day')
      const sevenDaysAgo = dayjs.utc().subtract(7, 'days')

      const fourteenDaysAgoTimestamp = `${fourteenDaysAgo.year()}-0${
        fourteenDaysAgo.month() + 1
      }-${fourteenDaysAgo.date()}T00:00:00+00:00`

      const sevenDaysAgoTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`

      try {
        const res = await gqlClient.request(WEEKLY_RANGED_SUCCESSFUL_RELAYS, {
          _eq: appPubKey,
          _gte: fourteenDaysAgoTimestamp,
          _lte: sevenDaysAgoTimestamp,
        })
        const totalRelaysRes = await gqlClient.request(
          TOTAL_RANGED_RELAYS_QUERY,
          {
            _eq: appPubKey,
            _gte: fourteenDaysAgoTimestamp,
            _lte: sevenDaysAgoTimestamp,
          }
        )

        const {
          relay_apps_daily_aggregate: {
            aggregate: {
              sum: { total_relays: successfulWeeklyRelays = 0 },
            },
          },
        } = res

        const {
          relay_apps_daily_aggregate: {
            aggregate: {
              sum: { total_relays: previousTotalRelays = 0 },
            },
          },
        } = totalRelaysRes

        return {
          previousTotalRelays: previousTotalRelays ?? 0,
          successfulWeeklyRelays: successfulWeeklyRelays ?? 0,
        }
      } catch (err) {
        console.log(err, 'rip')
      }
    }
  )

  return {
    isPreviousSuccessfulRelaysLoading,
    isPreviousSuccessfulRelaysError,
    previousSucessfulRelaysData,
  }
}

export function useLatestLatencyValues(appPubKey) {
  const {
    isError: isLatestLatencyError,
    isLoading: isLatestLatencyLoading,
    data: latestLatencyData,
  } = useQuery(
    `user/applications/${appPubKey}/latest-latency-values`,
    async function getWeeklyAppRelaysInfo() {
      if (!appPubKey) {
        return null
      }

      dayjs.extend(dayJsutcPlugin)

      const dayAgo = dayjs.utc().subtract(24, 'hour')

      const formattedTimestamp = `${dayAgo.year()}-0${
        dayAgo.month() + 1
      }-${dayAgo.date()}T${dayAgo.hour() + 1}:00:00+00:00`

      try {
        const res = await gqlClient.request(LATEST_LATENCY_VALUES_QUERY, {
          _eq: appPubKey,
          _gte: formattedTimestamp,
        })

        const { relay_app_hourly: rawHourlyLatency = [] } = res

        const hourlyLatency = new Map()

        for (const { bucket, elapsed_time: elapsedTime } of rawHourlyLatency) {
          if (!hourlyLatency.has(bucket)) {
            hourlyLatency.set(bucket, elapsedTime)
          } else {
            const currentCount = hourlyLatency.get(bucket)

            hourlyLatency.set(
              bucket,
              (Number(currentCount) + Number(elapsedTime)) / 2
            )
          }
        }

        const processedHourlyLatency = []

        for (const [bucket, hourlyLatencyAvg] of hourlyLatency.entries()) {
          processedHourlyLatency.push({ bucket, latency: hourlyLatencyAvg })
        }

        return processedHourlyLatency.reverse()
      } catch (err) {
        console.log(err, 'rip')
      }
    }
  )

  return {
    isLatestLatencyError,
    isLatestLatencyLoading,
    latestLatencyData,
  }
}
