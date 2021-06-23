import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ViewportProvider } from 'use-viewport'
import { Main } from '@pokt-foundation/ui'
import DashboardRoutes from 'views/DashboardRoutes'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Main>
        <ViewportProvider>
          <Router>
            <DashboardRoutes />
          </Router>
        </ViewportProvider>
      </Main>
    </QueryClientProvider>
  )
}

export default App
