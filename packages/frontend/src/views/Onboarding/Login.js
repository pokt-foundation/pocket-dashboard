import React, { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
import "styled-components/macro";
import {
  Button,
  Field,
  Link,
  Spacer,
  TextInput,
  textStyle,
  useTheme,
  GU,
  RADIUS,
} from "ui";
import OnboardingHeader from "components/OnboardingHeader/OnboardingHeader";
import env from "environment";

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [errors, setErrors] = useState([]);
  const theme = useTheme();
  const history = useHistory();

  const { isLoading, mutate } = useMutation(async function login(e) {
    try {
      const path = `${env("BACKEND_URL")}/api/users/login`;
      const res = await axios.post(
        path,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      if (res.status === 200 || res.status === 204) {
        history.push({
          pathname: "/home",
        });
      }
    } catch (err) {
      // TODO: Set err on UI AND send to sentry.
      const { errors } = err?.response?.data;

      setErrors(() => [...errors]);
    }
  });

  const onEmailChange = useCallback((e) => setEmail(e.target.value), []);
  const onPasswordChange = useCallback((e) => setPassword(e.target.value), []);
  const onInputFocus = useCallback(() => {
    if (errors.length) {
      setErrors([]);
    }
    if (emailError) {
      setEmailError(null);
    }
    if (passwordError) {
      setPasswordError(null);
    }
  }, [emailError, errors, passwordError]);
  const onEmailBlur = useCallback(() => {
    if (!email) {
      const emailError = {
        id: "INVALID_EMAIL",
        message: "Email cannot be empty",
      };

      setEmailError(emailError);
    }
  }, [email]);
  const onPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password cannot be empty",
      };

      setPasswordError(passwordError);
    }
  }, [password]);

  const isSubmitDisabled = useMemo(
    () => isLoading || errors.length > 0 || emailError || passwordError,
    [emailError, errors, passwordError, isLoading]
  );

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
        <form
          onSubmit={!isSubmitDisabled ? mutate : undefined}
          css={`
            display: flex;
            flex-direction: column;
          `}
        >
          <Field label="Email" required>
            <TextInput
              wide
              value={email}
              onChange={onEmailChange}
              onFocus={onInputFocus}
              onBlur={onEmailBlur}
            />
            <Spacer size={GU / 2} />
            {emailError && (
              <p
                css={`
                  color: ${theme.negative};
                `}
              >
                {emailError.message}
              </p>
            )}
          </Field>
          <Field label="Password" required>
            <TextInput
              wide
              value={password}
              onChange={onPasswordChange}
              onFocus={onInputFocus}
              onBlur={onPasswordBlur}
              type="password"
            />
            <Spacer size={GU / 2} />
            {passwordError && (
              <p
                css={`
                  color: ${theme.negative};
                `}
              >
                {passwordError.message}
              </p>
            )}
          </Field>
          <Spacer size={3 * GU} />
          <ul
            css={`
              list-style-type: none;
            `}
          >
            {errors.map(({ id, message }) => (
              <li
                key={`${id}_${message}`}
                css={`
                  color: ${theme.negative};
                `}
              >
                {message}
              </li>
            ))}
          </ul>
          <RouterLink
            to={{
              pathname: "/forgotpassword",
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
            type="submit"
            disabled={isSubmitDisabled}
            onClick={(e) => {
              e.preventDefault();
              mutate();
            }}
            css={`
              margin-bottom: ${2 * GU}px;
            `}
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
                pathname: "/signup",
              }}
              component={Link}
              external={false}
            >
              Get started.
            </RouterLink>
          </p>
        </form>
      </main>
    </div>
  );
}
