import React, { useCallback, useMemo, useState } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import { isEmail, isStrongPassword } from "validator";
import styled from "styled-components/macro";
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
import PoktShape from "assets/poktshape.png";

const InlineLink = styled(Link)`
  display: inline;
  vertical-align: bottom;
`;

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [repeatedPasswordError, setRepeatedPasswordError] = useState(null);
  const [errors, setErrors] = useState([]);
  const [checked, setChecked] = useState(false);
  const theme = useTheme();
  const { within } = useViewport();

  const compactMode = within(-1, "medium");

  const { isError, isLoading, isSuccess, mutate, reset } = useMutation(
    async function signup() {
      try {
        const path = `${env("BACKEND_URL")}/api/users/signup`;

        await axios.post(path, {
          email,
          password,
        });
      } catch (err) {
        const { errors = [] } = err?.response?.data;

        setErrors(() => [...errors]);

        throw new Error(errors);
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
      reset();
    }
    if (emailError) {
      setEmailError(null);
    }
    if (passwordError) {
      setPasswordError(null);
    }
    if (repeatedPasswordError) {
      setRepeatedPasswordError(null);
    }
  }, [emailError, errors, passwordError, repeatedPasswordError, reset]);
  const onEmailBlur = useCallback(() => {
    if (!email) {
      const emailError = {
        id: "INVALID_EMAIL",
        message: "Email cannot be empty",
      };

      setEmailError(emailError);
    }

    if (!isEmail(email)) {
      const emailError = {
        id: "INVALID_EMAIL",
        message: "Please enter a valid email.",
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
    } else if (!isStrongPassword(password)) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password's not strong enough.",
      };

      setPasswordError(passwordError);
    }
  }, [password]);
  const onRepeatedPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: "INVALID_PASSWORD",
        message: "Password cannot be empty",
      };

      setRepeatedPasswordError(passwordError);
    } else if (password !== repeatedPassword) {
      const passwordError = {
        id: "NON_MATCHING_PASSWORD",
        message: "Passwords don't match",
      };

      setRepeatedPasswordError(passwordError);
    }
  }, [password, repeatedPassword]);

  const isSubmitDisabled = useMemo(
    () =>
      isLoading ||
      isError ||
      errors.length > 0 ||
      emailError ||
      passwordError ||
      repeatedPasswordError,
    [
      emailError,
      errors,
      isError,
      isLoading,
      passwordError,
      repeatedPasswordError,
    ]
  );

  return (
    <div
      css={`
        position: relative;
        width: 100%;
        min-height: 100vh;
        height: 100%;
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
            Get started
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
                placeholder="example@pokt.network"
                onBlur={onEmailBlur}
                onChange={onEmailChange}
                onFocus={onInputFocus}
              />
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
                onBlur={onPasswordBlur}
                onChange={onPasswordChange}
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
            <Field label="Repeat Password" required>
              <TextInput
                wide
                value={repeatedPassword}
                onBlur={onRepeatedPasswordBlur}
                onChange={onRepeatedPasswordChange}
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
                A good password has at least 8 characters and at least 1
                alphanumeric symbol.
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
                <InlineLink href="https://dashboard.pokt.network/support/terms-of-service">
                  T. &amp; C.
                </InlineLink>{" "}
                and{" "}
                <InlineLink href="https://dashboard.pokt.network/support/privacy-policy">
                  Privacy Policy
                </InlineLink>
              </span>
            </label>
            <Button
              type="submit"
              mode="strong"
              disabled={isSubmitDisabled}
              onClick={(e) => {
                e.preventDefault();
                mutate();
              }}
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
                We've sent a verification email to {email}. Go and check it
                before it expires!
              </p>
            </Info>
          )}
        </main>
      </div>
    </div>
  );
}
