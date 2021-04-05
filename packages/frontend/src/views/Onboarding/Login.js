import React, { useCallback, useMemo, useState } from "react";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
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
import env from "environment";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
  }, [errors]);
  const onEmailBlur = useCallback(() => {
    if (!email) {
      const emailError = {
        id: "INVALID_EMAIL",
        message: "Email cannot be empty",
      };

      const filteredErrors = errors.filter(({ id }) => emailError.id !== id);

      setErrors([...filteredErrors, emailError]);
    }
  }, [errors, email]);
  const onPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password cannot be empty",
      };

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id);

      setErrors([...filteredErrors, passwordError]);
    }
  }, [errors, password]);

  const isSubmitDisabled = useMemo(() => isLoading || errors.length > 0, [
    errors,
    isLoading,
  ]);

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
          <Field
            label="Email"
            required
            css={`
              margin-bottom: ${5 * GU}px;
            `}
          >
            <TextInput
              wide
              value={email}
              onChange={onEmailChange}
              onFocus={onInputFocus}
              onBlur={onEmailBlur}
            />
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
              onFocus={onInputFocus}
              onBlur={onPasswordBlur}
              type="password"
            />
          </Field>
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
