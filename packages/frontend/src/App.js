import React, { Suspense, lazy } from "react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { ViewportProvider } from "use-viewport";
import { AppWrapper } from "ui";
import Home from "views/Home/Home";

/*
 As we don't want to load the whole app when the user gets to the landing page as it'd be a waste of space, we're code splitting the app itself by hiding the remaining routes behind another component that will actually load everything else. This way he only needs to download the bundles he's actually using, and will improve load times.
 */
const DashboardRoutes = lazy(() => import("views/DashboardRoutes"));

function App() {
  return (
    <AppWrapper>
      <ViewportProvider>
        <Router>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>
            <Route path="/dashboard">
              <Suspense fallback={<div>Loading...</div>}>
                <DashboardRoutes />
              </Suspense>
            </Route>
          </Switch>
        </Router>
      </ViewportProvider>
    </AppWrapper>
  );
}

export default App;
