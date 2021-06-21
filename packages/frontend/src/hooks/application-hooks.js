import axios from 'axios'
import { useQuery } from 'react-query'
import env from 'environment'
import * as Sentry from '@sentry/react'
import { sentryEnabled } from 'sentry'
import { KNOWN_QUERY_SUFFIXES } from 'known-query-suffixes'

const PER_PAGE = 10

export function useUserApplications() {
  const {
    isLoading: isAppsLoading,
    isError: isAppsError,
    data: appsData,
    refetch: refetchUserApps,
  } = useQuery(
    KNOWN_QUERY_SUFFIXES.USER_APPS,
    async function getUserApplications() {
      const appPath = `${env('BACKEND_URL')}/api/applications`
      const lbPath = `${env('BACKEND_URL')}/api/lb`

      try {
        const { data: appData } = await axios.get(appPath, {
          withCredentials: true,
        })
        const { data: lbData } = await axios.get(lbPath, {
          withCredentials: true,
        })

        const userApps = appData.map(({ ...rest }) => ({
          isLb: false,
          ...rest,
        }))
        const userLbs = lbData.map(({ ...rest }) => ({
          isLb: true,
          ...rest,
        }))

        const filteredApps = userApps.filter((app) => {
          for (const { apps } of userLbs) {
            if (apps.find((lbApp) => lbApp.appId === app.id)) {
              return false
            }
          }

          return true
        })

        return [...userLbs, ...filteredApps]
      } catch (err) {
        if (sentryEnabled) {
          Sentry.configureScope((scope) => {
            scope.setTransactionName(`QUERY ${KNOWN_QUERY_SUFFIXES.USER_APPS}`)
          })
          Sentry.captureException(err)
        }
        throw err
      }
    }
  )

  return {
    appsData,
    isAppsError,
    isAppsLoading,
    refetchUserApps,
  }
}

export function useLatestRelays({
  id = '',
  page = 0,
  limit = 10,
  isLb = true,
}) {
  const { isLoading, isError, data: latestRelayData } = useQuery(
    [KNOWN_QUERY_SUFFIXES.LATEST_RELAYS, id, isLb, limit, page],
    async function getLatestRelays() {
      if (!id) {
        return []
      }
      const path = `${env('BACKEND_URL')}/api/${
        isLb ? 'lb' : 'applications'
      }/latest-relays`

      try {
        const { data } = await axios.post(
          path,
          {
            id,
            limit,
            offset: page * PER_PAGE,
          },
          {
            withCredentials: true,
          }
        )

        return data.session_relays
      } catch (err) {
        if (sentryEnabled) {
          Sentry.configureScope((scope) => {
            scope.setTransactionName(
              `QUERY ${KNOWN_QUERY_SUFFIXES.LATEST_RELAYS}`
            )
          })
          Sentry.captureException(err)
        }
        throw err
      }
    },
    {
      keepPreviousData: true,
    }
  )

  return {
    isLoading,
    isError,
    latestRelayData,
  }
}
