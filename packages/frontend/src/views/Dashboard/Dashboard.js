import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import 'styled-components/macro'
import { Spacer, useTheme, GU } from 'ui'
import NavigationBar from 'views/Dashboard/NavigationBar'
import MenuPanel from 'components/MenuPanel/MenuPanel'
import { AppsContextProvider, useUserApps } from 'contexts/AppsContext'

function DashboardView({ children }) {
  const location = useLocation()
  const { appsLoading, userApps } = useUserApps()
  const theme = useTheme()

  useEffect(() => {
    document.body.scrollTop = 0
  }, [location])

  return (
    <div
      css={`
        position: relative;
        width: 100%;
        min-height: 100vh;
        height: 100%;
        display: flex;
        flex-direction: row;
        background: ${theme.dashboardBackground};
        color: white;
        overflow-x: hidden;
      `}
    >
      <MenuPanel appsLoading={appsLoading} userApps={userApps} />
      <main
        css={`
          height: auto;
          overflow-y: scroll;
          overflow-x: hidden;
          flex-grow: 1;
          max-width: 1152px;
          margin: 0 auto;
          padding-left: ${2 * GU}px;
          padding-right: ${2 * GU}px;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        `}
      >
        <NavigationBar applications={userApps} />
        <Spacer size={5 * GU} />
        {children}
        <Spacer size={2 * GU} />
      </main>
    </div>
  )
}

export default function Dashboard({ children }) {
  return (
    <AppsContextProvider>
      <DashboardView>{children}</DashboardView>
    </AppsContextProvider>
  )
}
