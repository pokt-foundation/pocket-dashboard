import React, { useCallback, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import "styled-components/macro";
import {
  Button,
  Field,
  Link,
  TextInput,
  textStyle,
  useTheme,
  GU,
  RADIUS,
} from "ui";
import OnboardingHeader from "components/OnboardingHeader/OnboardingHeader";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const theme = useTheme();
  const history = useHistory();

  const onUsernameChange = useCallback((e) => setUsername(e.target.value), []);
  const onPasswordChange = useCallback((e) => setPassword(e.target.value), []);

  return (
    <div
      css={`
        width: 100%;
        min-height: 100vh;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background: ${theme.background};
      `}
    >
      <OnboardingHeader />
      <main
        css={`
          width: 100%;
          height: auto;
          max-width: ${120 * GU}px;
          border-radius: ${RADIUS}px;
          padding: ${5 * GU}px ${8 * GU}px;
          border: 1px solid ${theme.border};
          background: ${theme.surface};
          display: flex;
          flex-direction: column;
        `}
      >
        <h2
          css={`
            ${textStyle("title2")}
            margin-bottom: ${6 * GU}px;
          `}
        >
          Welcome back
        </h2>
        <Field
          label="Username"
          required
          css={`
            margin-bottom: ${5 * GU}px;
          `}
        >
          <TextInput wide value={username} onChange={onUsernameChange} />
        </Field>
        <Field
          label="Password"
          required
          css={`
            margin-bottom: ${6 * GU}px;
          `}
        >
          <TextInput
            wide
            value={password}
            onChange={onPasswordChange}
            type="password"
          />
        </Field>
        <RouterLink
          to={{
            pathname: "/dashboard/forgotpassword",
          }}
          component={Link}
          external={false}
          css={`
            text-align: left;
            margin-bottom: ${6 * GU}px;
          `}
        >
          Forgot your password?
        </RouterLink>
        <Button
          css={`
            margin-bottom: ${2 * GU}px;
          `}
          onClick={() =>
            history.push({
              pathname: "/dashboard/home",
            })
          }
        >
          Log in
        </Button>
        <p
          css={`
            text-align: center;
          `}
        >
          Don't have an account?{" "}
          <RouterLink
            to={{
              pathname: "/dashboard/signup",
            }}
            component={Link}
            external={false}
          >
            Get started.
          </RouterLink>
        </p>
      </main>
    </div>
  );
}
