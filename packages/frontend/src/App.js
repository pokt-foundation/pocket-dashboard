import React from "react";
import { HashRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ViewportProvider } from "use-viewport";
import { AppWrapper } from "ui";
import DashboardRoutes from "views/DashboardRoutes";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWrapper>
        <ViewportProvider>
          <Router>
            <DashboardRoutes />
          </Router>
        </ViewportProvider>
      </AppWrapper>
    </QueryClientProvider>
  );
}

export default App;
