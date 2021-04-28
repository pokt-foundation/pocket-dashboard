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
import PoktShape from "assets/poktshape.png";

export default function NewPassword() {
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [repeatedPasswordError, setRepeatedPasswordError] = useState(null);
  const [errors, setErrors] = useState([]);
  const { search } = useLocation();
  const history = useHistory();
  const theme = useTheme();

  const token = new URLSearchParams(search).get("token");
  const rawEmail = new URLSearchParams(search).get("email");
  const email = decodeURIComponent(rawEmail);

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
    if (passwordError) {
      setPasswordError(null);
    }
    if (repeatedPasswordError) {
      setRepeatedPasswordError(null);
    }
  }, [errors, passwordError, repeatedPasswordError]);
  const onPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password cannot be empty",
      };

      setPasswordError(passwordError);
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

      setRepeatedPasswordError(passwordError);
    } else if (!isStrongPassword(repeatedPassword)) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password's not strong enough.",
      };

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id);

      setErrors([...filteredErrors, passwordError]);
    } else if (password !== repeatedPassword) {
      const passwordError = {
        id: "NON_MATCHING_PASSWORD",
        message: "Passwords don't match",
      };

      setRepeatedPasswordError(passwordError);
    }
  }, [errors, password, repeatedPassword]);

  const isSubmitDisabled = useMemo(
    () =>
      isLoading ||
      isError ||
      errors.length > 0 ||
      passwordError ||
      repeatedPasswordError,
    [errors, isError, isLoading, passwordError, repeatedPasswordError]
  );

  return (
    <div
      css={`
        position: relative;
        width: 100%;
        min-height: 100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: #091828;
      `}
    >
      <OnboardingHeader />
      <img
        src={PoktShape}
        css={`
          position: absolute;
          bottom: 0%;
          right: -5%;
          width: 50%;
          max-width: ${80 * GU}px;
          height: auto;
          z-index: 1;
        `}
        alt="Ball"
      />
      <div
        css={`
          width: 100%;
          max-width: ${87 * GU}px;
        `}
      >
        <div
          css={`
            display: flex;
          `}
        >
          <Spacer size={8 * GU} />
          <h2
            css={`
              ${textStyle("title2")}
              margin-bottom: ${6 * GU}px;
              align-self: flex-start;
            `}
          >
            New password
          </h2>
        </div>
        <main
          css={`
            position: relative;
            z-index: 2;
            width: 100%;
            height: auto;
            max-width: ${120 * GU}px;
            border-radius: ${RADIUS * 2}px;
            padding: ${5 * GU}px ${8 * GU}px;
            background: ${theme.surface};
            display: flex;
            flex-direction: column;
          `}
        >
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
          <Field label="Password confirmation" required>
            <TextInput
              wide
              value={repeatedPassword}
              onChange={onRepeatedPasswordChange}
              onBlur={onRepeatedPasswordBlur}
              onFocus={onInputFocus}
              type="password"
            />
            {repeatedPasswordError && (
              <p
                css={`
                  color: ${theme.negative};
                `}
              >
                {repeatedPasswordError.message}
              </p>
            )}
            <Spacer size={1 * GU} />
            <p
              css={`
                ${textStyle("body4")}
                color: ${theme.surfaceContentSecondary};
              `}
            >
              A good password has at least 8 characters, 1 uppercase character,
              1 number and 1 symbol.
            </p>
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
            mode="strong"
            disabled={isSubmitDisabled}
            onClick={mutate}
          >
            Set new password
          </Button>
        </main>
      </div>
    </div>
  );
}
