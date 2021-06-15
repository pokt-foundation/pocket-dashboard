import axios from 'axios'
import { useQueries } from 'react-query'
import env from 'environment'

export function useAppMetrics({ activeApplication }) {
  const { appId } = activeApplication
  const results = useQueries([
    {
      queryKey: `lb/${appId}/active-application`,
      queryFn: async function getActiveApplication() {
        const { applicationIDs } = activeApplication
        const results = await Promise.all(
          applicationIDs.map(async (appId) => {
            console.log(appId, 'dios')
            const path = `${env('BACKEND_URL')}/api/applications/${appId}`

            try {
              const { data } = await axios.get(path, {
                withCredentials: true,
              })

              return data
            } catch (err) {
              console.log(err)
            }
          })
        )

        return results
      },
    },
    {
      queryKey: `lb/${appId}/total-weekly-relays-avg-latency`,
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
        const path = `${env('BACKEND_URL')}/api/lb/total-relays/${appId}`

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
      queryKey: `lb/${appId}/successful-weekly-relays-avg-latency`,
      queryFn: async function getSuccessfulWeeklyRelaysAndLatency() {
        const path = `${env('BACKEND_URL')}/api/lb/successful-relays/${appId}`

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
      queryKey: `lb/${appId}/daily-relays`,
      queryFn: async function getDailyRelays() {
        const path = `${env('BACKEND_URL')}/api/lb/daily-relays/${appId}`

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
      queryKey: `lb/${appId}/session-relays`,
      queryFn: async function getTotalSessionRelays() {
        const path = `${env('BACKEND_URL')}/api/lb/session-relays/${appId}`

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
      queryKey: `lb/${appId}/latest-relays`,
      queryFn: async function getLatestRelays() {
        const path = `${env('BACKEND_URL')}/api/lb/latest-relays/${appId}`

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
      queryKey: `lb/${appId}/previous-successful-relays`,
      queryFn: async function getPreviousSuccessfulRelays() {
        const path = `${env(
          'BACKEND_URL'
        )}/api/lb/previous-successful-relays/${appId}`

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
      queryKey: `lb/${appId}/hourly-latency`,
      queryFn: async function getTotalWeeklyRelaysAndLatency() {
        const path = `${env('BACKEND_URL')}/api/lb/hourly-latency/${appId}`

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
