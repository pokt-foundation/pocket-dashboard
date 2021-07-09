import React, { useCallback, useContext, useMemo } from 'react'
import { useUserApplications } from 'hooks/application-hooks'
import { log } from 'lib/utils'

const DEFAULT_APP_STATE = {
  appsLoading: true,
  userApps: [],
}

const AppsContext = React.createContext(DEFAULT_APP_STATE)

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

  const appsLoading = isAppsLoading

  const refetchApps = useCallback(async () => {
    await refetchUserApps()
  }, [refetchUserApps])

  const userApps = useMemo(() => {
    if (appsLoading) {
      return DEFAULT_APP_STATE
    }

    return { appsLoading, userApps: appsData, refetchApps }
  }, [appsData, appsLoading, refetchApps])

  log('USER APPS:', userApps)

  return (
    <AppsContext.Provider value={userApps}>{children}</AppsContext.Provider>
  )
}
