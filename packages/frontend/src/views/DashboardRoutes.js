import React from "react";
import { Route, Switch } from "react-router-dom";
import { useViewport } from "use-viewport";
import { ErrorBoundary } from "@sentry/react";
import "styled-components/macro";
import { useTheme } from "ui";
import Create from "views/Dashboard/Create/Create";
import Dashboard from "views/Dashboard/Dashboard";
import Fallback from "views/Fallback";
import ForgotPassword from "views/Onboarding/ForgotPassword";
import NetworkStatus from "views/Dashboard/Network/NetworkStatus";
import MyApp from "views/Dashboard/ApplicationDetail/ApplicationDetail";
import NewPassword from "views/Onboarding/NewPassword";
import Login from "views/Onboarding/Login";
import Signup from "views/Onboarding/Signup";
import Validate from "views/Onboarding/Validate";

export default function DashboardRoutes() {
  const { within } = useViewport();
  const theme = useTheme();

  const compactMode = within(-1, "medium");

  return (
    <div
      css={`
        /*
          We wanna enforce a non-scrollable "dashboard" view inside the app,
          so we force the container div to always be height and width of the screen.
          For mobile devices we don't want this restriction, so we only set this rule
          on large screen sizes.
        */
        min-width: 100vw;
        min-height: 100vh;
        height: 100%;
        overflow-y: scroll;
        background: ${theme.background};
        /* We also wanna "trap" any absolute elements so that they don't end up behind the div. */
        display: relative;
        /* ${!compactMode &&
        `
          max-width: 100vw;
          max-height: 100vh;
        `} */
        overflow-x: hidden;
      `}
    >
      <ErrorBoundary fallback={Fallback} showDialog>
        <Switch>
          <Route exact path={`/`}>
            <Login />
          </Route>
          <Route exact path={`/signup`}>
            <Signup />
          </Route>
          <Route exact path={`/login`}>
            <Login />
          </Route>
          <Route exact path={`/validate`}>
            <Validate />
          </Route>
          <Route exact path={`/forgotpassword`}>
            <ForgotPassword />
          </Route>
          <Route exact path={`/newpassword`}>
            <NewPassword />
          </Route>
          <Route exact path={`/fallback`}>
            <Fallback />
          </Route>
          <Dashboard>
            <Route exact path={`/home`}>
              <NetworkStatus />
            </Route>
            <Route path={`/app/:appId`}>
              <MyApp />
            </Route>
            <Route exact path={`/create`}>
              <Create />
            </Route>
          </Dashboard>
        </Switch>
      </ErrorBoundary>
    </div>
  );
}
