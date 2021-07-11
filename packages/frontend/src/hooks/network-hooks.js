import axios from 'axios'
import * as dayjs from 'dayjs'
import * as dayJsutcPlugin from 'dayjs/plugin/utc'
import { GraphQLClient, gql } from 'graphql-request'
import { useQuery } from 'react-query'
import env from 'environment'

const gqlClient = new GraphQLClient(env('HASURA_URL'), {
  headers: {
    'x-hasura-admin-secret': env('HASURA_SECRET'),
  },
})

const RELAY_APPS_QUERY = gql`
  query DAILY_RELAYS_QUERY {
    relays_daily(limit: 8, order_by: { bucket: desc }) {
      bucket
      total_relays
    }
  }
`

const WEEKLY_RELAY_COUNT_QUERY = gql`
  query DAILY_RELAYS_QUERY($_gte: timestamptz!) {
    relay_apps_hourly_aggregate(where: { bucket: { _gte: $_gte } }) {
      aggregate {
        sum {
          total_relays
        }
      }
    }
  }
`

export function useNetworkSummary() {
  const {
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    data: summaryData,
  } = useQuery('/network/summary', async function getNetworkSummary() {
    const path = `${env('BACKEND_URL')}/api/network/summary`

    try {
      const {
        data: { summary },
      } = await axios.get(path, {
        withCredentials: true,
      })

      return summary
    } catch (err) {
      console.log('?', err)
    }
  })

  return {
    isSummaryError,
    isSummaryLoading,
    summaryData,
  }
}

export function useChains() {
  const {
    isLoading: isChainsLoading,
    isError: isChainsError,
    data: chains,
  } = useQuery('/network/chains', async function getNetworkChains() {
    const path = `${env('BACKEND_URL')}/api/network/chains`

    try {
      const res = await axios.get(path, {
        withCredentials: true,
      })

      const {
        data: { chains },
      } = res

      return chains
    } catch (err) {
      console.log('?', err)
    }
  })

  return {
    isChainsError,
    isChainsLoading,
    chains,
  }
}

export function useTotalWeeklyRelays() {
  const {
    isLoading: isRelaysLoading,
    isError: isRelaysError,
    data: relayData,
  } = useQuery('network/weekly-relays', async function getWeeklyRelays() {
    try {
      const res = await gqlClient.request(RELAY_APPS_QUERY)

      dayjs.extend(dayJsutcPlugin)

      const sevenDaysAgo = dayjs.utc().subtract(7, 'day')

      const formattedTimestamp = `${sevenDaysAgo.year()}-0${
        sevenDaysAgo.month() + 1
      }-${sevenDaysAgo.date()}T00:00:00+00:00`

      const totalWeeklyRelaysRes = await gqlClient.request(
        WEEKLY_RELAY_COUNT_QUERY,
        {
          _gte: formattedTimestamp,
        }
      )

      const {
        relay_apps_hourly_aggregate: {
          aggregate: {
            sum: { total_relays: totalWeeklyRelays },
          },
        },
      } = totalWeeklyRelaysRes
      const { relays_daily: dailyRelays } = res

      const processedDailyRelays = dailyRelays.reverse()

      return { dailyRelays: processedDailyRelays, totalWeeklyRelays }
    } catch (err) {
      console.log(err, 'rip')
    }
  })

  return {
    isRelaysError,
    isRelaysLoading,
    relayData,
  }
}

export function useNetworkSuccessRate() {
  const {
    isLoading: isSuccessRateLoading,
    isError: isSuccessRateError,
    data: successRateData,
  } = useQuery('network/success-rate', async function getWeeklyRelays() {
    const successfulPath = `${env(
      'BACKEND_URL'
    )}/api/network/weekly-successful-relays`
    const totalPath = `${env('BACKEND_URL')}/api/network/total-weekly-relays`

    try {
      const {
        data: { total_relays: successfulRelays },
      } = await axios.get(successfulPath, {
        withCredentials: true,
      })
      const {
        data: { total_relays: totalRelays },
      } = await axios.get(totalPath, {
        withCredentials: true,
      })

      return { successfulRelays, totalRelays }
    } catch (err) {
      console.log(err, 'rip')
    }
  })

  return {
    isSuccessRateError,
    isSuccessRateLoading,
    successRateData,
  }
}
