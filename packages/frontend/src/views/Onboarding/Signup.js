import React, { useCallback, useMemo, useState } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { isEmail, isStrongPassword } from "validator";
import "styled-components/macro";
import { useViewport } from "use-viewport";
import {
  Button,
  Field,
  CheckBox,
  Link,
  Spacer,
  TextInput,
  textStyle,
  useTheme,
  GU,
  RADIUS,
  Info,
} from "ui";
import OnboardingHeader from "components/OnboardingHeader/OnboardingHeader";
import env from "environment";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [checked, setChecked] = useState(false);
  const theme = useTheme();
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  const { isError, isLoading, isSuccess, mutate } = useMutation(
    async function signup(e) {
      console.log(e);
      e.preventDefault();
      try {
        const path = `${env("BACKEND_URL")}/api/users/signup`;

        await axios.post(path, {
          email,
          password,
        });
      } catch (err) {
        // TODO: Set err on UI AND send to sentry.
        const { errors = [] } = err?.response?.data;

        setErrors(() => [...errors]);
      }
    }
  );

  const onCheckChange = useCallback((e) => setChecked(e), []);
  const onEmailChange = useCallback((e) => setEmail(e.target.value), []);
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
  const onEmailBlur = useCallback(() => {
    if (!email) {
      const emailError = {
        id: "INVALID_EMAIL",
        message: "Email cannot be empty",
      };

      const filteredErrors = errors.filter(({ id }) => emailError.id !== id);

      setErrors([...filteredErrors, emailError]);
    }

    if (!isEmail(email)) {
      const emailError = {
        id: "INVALID_EMAIL",
        message: "Please enter a valid email.",
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
          Get started
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
              onBlur={onEmailBlur}
              onChange={onEmailChange}
              onFocus={onInputFocus}
            />
          </Field>
          <Field label="Password" required>
            <TextInput
              wide
              value={password}
              onBlur={onPasswordBlur}
              onChange={onPasswordChange}
              onFocus={onInputFocus}
              type="password"
            />
          </Field>
          <Field label="Repeat Password" required>
            <TextInput
              wide
              value={repeatedPassword}
              onBlur={onRepeatedPasswordBlur}
              onChange={onRepeatedPasswordChange}
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
          <label
            css={`
              margin-bottom: ${6 * GU}px;
              ${textStyle("body2")}
              word-break: ${compactMode ? "break-word" : "break-all"};
            `}
          >
            <CheckBox
              checked={checked}
              onChange={onCheckChange}
              aria-label="I agree to the pocket Dashboard terms and conditions"
              css={`
                display: inline-block;
              `}
            />
            <span
              css={`
                padding-top: 5px;
                vertical-align: bottom;
                margin-left: ${1 * GU}px;
              `}
            >
              I Agree to the Pocket Dashboard's{" "}
              <Link
                href="#"
                css={`
                  display: inline;
                `}
              >
                T. &amp; C. and Privacy Policy
              </Link>
            </span>
          </label>
          <Button
            type="submit"
            disabled={isSubmitDisabled}
            onClick={(e) => mutate(e)}
            css={`
              margin-bottom: ${2 * GU}px;
            `}
          >
            Sign up
          </Button>
        </form>
        {isSuccess && !isError && (
          <Info>
            <p
              css={`
                ${textStyle("body3")}
              `}
            >
              You're almost there!{" "}
              <span role="img" aria-label="Rocket Emoji">
                🚀
              </span>
            </p>
            <Spacer size={1 * GU} />
            <p
              css={`
                ${textStyle("body3")}
              `}
            >
              We've sent a verification email to {email}. Go and check it before
              it expires!
            </p>
          </Info>
        )}
      </main>
    </div>
  );
}
