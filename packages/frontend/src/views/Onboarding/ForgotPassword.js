import React, { useCallback, useState } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import "styled-components/macro";
import {
  Button,
  Field,
  Link,
  Info,
  Spacer,
  TextInput,
  textStyle,
  useTheme,
  GU,
  RADIUS,
} from "ui";
import OnboardingHeader from "components/OnboardingHeader/OnboardingHeader";
import env from "environment";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const theme = useTheme();

  const { isLoading, isSuccess, mutate } = useMutation(
    async function sendResetEmail(e) {
      const path = `${env("BACKEND_URL")}/api/users/send-reset-email`;

      try {
        await axios.post(path, {
          email,
        });
      } catch (err) {
        throw new Error(err);
      }
    }
  );

  const onEmailChange = useCallback((e) => setEmail(e.target.value), []);

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
          Reset your password
        </h2>
        <p
          css={`
            margin-bottom: ${6 * GU}px;
          `}
        >
          If the email you specify exists, we'll send an email with instructions
          for resetting your email. Remember you can{" "}
          <Link href="#">contact us</Link> if you have any issues.
        </p>
        <Field
          label="Email"
          required
          css={`
            margin-bottom: ${6 * GU}px;
          `}
        >
          <TextInput
            wide
            value={email}
            onChange={onEmailChange}
            type="email"
            disabled={isLoading || isSuccess}
          />
        </Field>
        <Button
          css={`
            margin-bottom: ${2 * GU}px;
          `}
          disabled={isLoading || isSuccess}
          onClick={(e) => mutate(e)}
        >
          Send email
        </Button>
        <Spacer size={1 * GU} />
        {isSuccess && (
          <Info>
            We've sent an email! Check it out soon, as it will be valid for the
            next 15 minutes only.
          </Info>
        )}
      </main>
    </div>
  );
}
