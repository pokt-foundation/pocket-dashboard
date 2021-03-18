import React, { Suspense, lazy } from "react";
import { HashRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ViewportProvider } from "use-viewport";
import { AppWrapper } from "ui";

/*
 As we don't want to load the whole app when the user gets to the landing page as it'd be a waste of space, we're code splitting the app itself by hiding the remaining routes behind another component that will actually load everything else. This way he only needs to download the bundles he's actually using, and will improve load times.
 */
const DashboardRoutes = lazy(() => import("views/DashboardRoutes"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppWrapper>
        <ViewportProvider>
          <Router>
            <Suspense fallback={<div>Loading...</div>}>
              <DashboardRoutes />
            </Suspense>
          </Router>
        </ViewportProvider>
      </AppWrapper>
    </QueryClientProvider>
  );
}

export default App;
