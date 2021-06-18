import axios from 'axios'
import { useQuery } from 'react-query'
import env from 'environment'

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
