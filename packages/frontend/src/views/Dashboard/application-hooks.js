import axios from 'axios'
import { useQuery } from 'react-query'
import env from 'environment'

const PER_PAGE = 10

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

      const userApps = data.map(({ ...rest }) => ({
        isLb: false,
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

      const userApps = data.map(({ ...rest }) => ({
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

export function useLatestRelays({
  id = '',
  page = 0,
  limit = 10,
  isLb = true,
}) {
  const { isLoading, isError, data: latestRelayData } = useQuery(
    [`user/${id}/latest-relays`, page],
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
        console.log(err, 'rip')
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
