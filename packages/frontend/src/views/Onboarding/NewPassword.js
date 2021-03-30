import React, { useCallback, useMemo, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
import { isStrongPassword } from "validator";
import "styled-components/macro";
import {
  Button,
  Field,
  Spacer,
  TextInput,
  textStyle,
  useTheme,
  GU,
  RADIUS,
} from "ui";
import OnboardingHeader from "components/OnboardingHeader/OnboardingHeader";
import env from "environment";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const { search } = useLocation();
  const history = useHistory();
  const theme = useTheme();

  const token = new URLSearchParams(search).get("token");
  const email = new URLSearchParams(search).get("email");

  const { isLoading, isError, mutate } = useMutation(
    async function sendResetEmail() {
      const path = `${env("BACKEND_URL")}/api/users/reset-password`;

      try {
        await axios.post(path, {
          plainToken: token,
          password1: password,
          password2: repeatedPassword,
          email,
        });

        history.push("/login");
      } catch (err) {
        console.log(Object.entries(err), "rip");
      }
    }
  );

  const onPasswordChange = useCallback((e) => setPassword(e.target.value), []);
  const onRepeatedPasswordChange = useCallback(
    (e) => setRepeatedPassword(e.target.value),
    []
  );
  const onInputFocus = useCallback(() => {
    if (errors.length) {
      setErrors([]);
    }
  }, [errors]);
  const onPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password cannot be empty",
      };

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id);

      setErrors([...filteredErrors, passwordError]);
    } else if (!isStrongPassword(password)) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password's not strong enough.",
      };

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id);

      setErrors([...filteredErrors, passwordError]);
    }
  }, [errors, password]);
  const onRepeatedPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password cannot be empty",
      };

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id);

      setErrors([...filteredErrors, passwordError]);
    } else if (password !== repeatedPassword) {
      const passwordError = {
        id: "NON_MATCHING_PASSWORD",
        message: "Passwords don't match",
      };

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id);

      setErrors([...filteredErrors, passwordError]);
    }
  }, [errors, password, repeatedPassword]);

  const isSubmitDisabled = useMemo(
    () => isLoading || isError || errors.length > 0,
    [errors, isError, isLoading]
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
          Set your new password
        </h2>
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
            onBlur={onPasswordBlur}
            onFocus={onInputFocus}
            type="password"
          />
        </Field>
        <Field label="Password confirmation" required>
          <TextInput
            wide
            value={repeatedPassword}
            onChange={onRepeatedPasswordChange}
            onBlur={onRepeatedPasswordBlur}
            onFocus={onInputFocus}
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
        <Spacer size={2 * GU} />
        <Button
          css={`
            margin-bottom: ${2 * GU}px;
          `}
          disabled={isSubmitDisabled}
          onClick={mutate}
        >
          Set new password
        </Button>
      </main>
    </div>
  );
}
