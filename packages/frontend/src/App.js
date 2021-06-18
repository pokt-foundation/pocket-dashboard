import React from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { AppWrapper } from 'ui'
import DashboardRoutes from 'views/DashboardRoutes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWrapper>
        <Router>
          <DashboardRoutes />
        </Router>
      </AppWrapper>
    </QueryClientProvider>
  )
}

export default App
