import React, { useCallback, useContext, useMemo } from 'react'
import {
  useUserApplications,
  useUserLoadBalancers,
} from 'views/Dashboard/application-hooks'
import { log } from 'lib/utils'

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
  const { isAppsLoading, appsData, refetchUserApps } = useUserApplications()
  const {
    lbData,
    isLbLoading,
    refetchUserApps: refetchLoadBalancers,
  } = useUserLoadBalancers()

  const appsLoading = isAppsLoading || isLbLoading

  const refetchApps = useCallback(async () => {
    await refetchUserApps()
    await refetchLoadBalancers()
  }, [refetchLoadBalancers, refetchUserApps])

  const userApps = useMemo(() => {
    if (appsLoading) {
      return DEFAULT_APP_STATE
    }

    const filteredApps = appsData.filter((app) => {
      for (const { apps } of lbData) {
        if (apps.find((lbApp) => lbApp.appId === app.id)) {
          return false
        }
      }

      return true
    })

    return { appsLoading, userApps: [...lbData, ...filteredApps], refetchApps }
  }, [appsData, appsLoading, lbData, refetchApps])

  log('USER APPS:', userApps)

  return (
    <AppsContext.Provider value={userApps}>{children}</AppsContext.Provider>
  )
}
