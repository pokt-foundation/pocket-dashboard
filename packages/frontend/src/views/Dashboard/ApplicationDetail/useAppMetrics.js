import axios from 'axios'
import { useQueries } from 'react-query'
import env from 'environment'
import { log } from 'lib/utils'

export const KNOWN_QUERY_SUFFIXES = {
  WEEKLY_TOTAL_METRICS: 'WEEKLY_TOTAL_METRICS',
  WEEKLY_SUCCESSFUL_METRICS: 'WEEKLY_SUCCESSFUL_METRICS',
  DAILY_BREAKDOWN_METRICS: 'DAILY_BREAKDOWN_METRICS',
  SESSION_METRICS: 'SESSION_METRICS',
  PREVIOUS_SUCCESSFUL_METRICS: 'PREVIOUS_SUCCESSFUL_METRICS',
  PREVIOUS_TOTAL_METRICS: 'PREVIOUS_TOTAL_METRICS',
  HOURLY_LATENCY_METRICS: 'HOURLY_LATENCY_METRICS',
  ONCHAIN_DATA: 'ONCHAIN_DATA',
}

export function useAppMetrics({ activeApplication }) {
  const { id: appId = '', isLb = false } = activeApplication
  const type = isLb ? 'lb' : 'applications'

  const results = useQueries([
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.WEEKLY_TOTAL_METRICS, type, appId],
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
        log(type, appId)
        const path = `${env('BACKEND_URL')}/api/${type}/total-relays/${appId}`

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
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.WEEKLY_SUCCESSFUL_METRICS, type, appId],
      queryFn: async function getSuccessfulWeeklyRelaysAndLatency() {
        const path = `${env(
          'BACKEND_URL'
        )}/api/${type}/successful-relays/${appId}`

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
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.DAILY_BREAKDOWN_METRICS, type, appId],
      queryFn: async function getDailyRelays() {
        const path = `${env('BACKEND_URL')}/api/${type}/daily-relays/${appId}`

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
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.SESSION_METRICS, type, appId],
      queryFn: async function getTotalSessionRelays() {
        const path = `${env('BACKEND_URL')}/api/${type}/session-relays/${appId}`

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
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.PREVIOUS_SUCCESSFUL_METRICS, type, appId],
      queryFn: async function getPreviousSuccessfulRelays() {
        const path = `${env(
          'BACKEND_URL'
        )}/api/${type}/previous-successful-relays/${appId}`

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
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.PREVIOUS_TOTAL_METRICS, type, appId],
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
        const path = `${env('BACKEND_URL')}/api/${type}/ranged-relays/${appId}`

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
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.HOURLY_LATENCY_METRICS, type, appId],
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
        const path = `${env('BACKEND_URL')}/api/${type}/hourly-latency/${appId}`

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
    {
      queryKey: [KNOWN_QUERY_SUFFIXES.ONCHAIN_DATA, type, appId],
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
        const path = `${env('BACKEND_URL')}/api/${type}/status/${appId}`

        try {
          const { data } = await axios.get(path, {
            withCredentials: true,
          })

          log('onchaindata:', data)

          return data
        } catch (err) {
          console.log(err)
        }
      },
    },
  ])

  const metricsLoading = results.reduce(
    (loading, result) => result.isLoading || loading,
    false
  )

  return { metricsLoading, metrics: results }
}
