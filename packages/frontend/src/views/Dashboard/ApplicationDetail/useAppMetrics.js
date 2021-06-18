import axios from 'axios'
import { useQueries } from 'react-query'
import env from 'environment'

export function useAppMetrics({ activeApplication }) {
  const { id: appId = '', isLb = false } = activeApplication
  const type = isLb ? 'lb' : 'applications'

  const results = useQueries([
    {
      queryKey: `${type}/${appId}/total-weekly-relays-avg-latency`,
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
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
      queryKey: `${type}/${appId}/successful-weekly-relays-avg-latency`,
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
      queryKey: `${type}/${appId}/daily-relays`,
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
      queryKey: `${type}/${appId}/session-relays`,
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
      queryKey: `${type}/${appId}/previous-successful-relays`,
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
      queryKey: `${type}/${appId}/ranged-relays`,
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
      queryKey: `${type}/${appId}/hourly-latency`,
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
      queryKey: `${type}/${appId}/on-chain-data`,
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
        const path = `${env('BACKEND_URL')}/api/${type}/status/${appId}`

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

  const metricsLoading = results.reduce(
    (loading, result) => result.isLoading || loading,
    false
  )

  return { metricsLoading, metrics: results }
}
