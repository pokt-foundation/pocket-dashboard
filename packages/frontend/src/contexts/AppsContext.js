import React, { useContext, useMemo } from 'react'
import {
  useUserApplications,
  useUserLoadBalancers,
} from 'views/Dashboard/application-hooks'

const DEFAULT_APP_STATE = {
  appsLoading: true,
  userApps: [],
}

const AppsContext = React.createContext()

export function useUserApps() {
  const context = useContext(AppsContext)

  if (!context) {
    throw new Error(
      'useUserApps cannot be used without declaring the provider.'
    )
  }

  return context
}

export function AppsContextProvider({ children }) {
  const { isAppsLoading, appsData } = useUserApplications()
  const { lbData, isLbLoading } = useUserLoadBalancers()

  const appsLoading = isAppsLoading || isLbLoading

  const userApps = useMemo(() => {
    if (appsLoading) {
      return DEFAULT_APP_STATE
    }
    const filteredApps = appsData.filter(
      (app) =>
        !lbData.reduce((_, lb) => lb.applicationIDs.includes(app.appId), false)
    )

    return { appsLoading, userApps: [...lbData, ...filteredApps] }
  }, [appsData, appsLoading, lbData])

  return (
    <AppsContext.Provider value={userApps}>{children}</AppsContext.Provider>
  )
}
