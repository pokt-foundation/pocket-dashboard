import React, { useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
import "styled-components/macro";
import { Link, Spacer, textStyle, useTheme, GU, RADIUS } from "ui";
import OnboardingHeader from "components/OnboardingHeader/OnboardingHeader";
import env from "environment";

export default function Login() {
  const theme = useTheme();
  const { search } = useLocation();

  const token = new URLSearchParams(search).get("token");
  const email = new URLSearchParams(search).get("email");

  const { isError, isLoading, isSuccess, mutate } = useMutation(
    async function validate() {
      try {
        const path = `${env("BACKEND_URL")}/api/users/validate-user`;

        await axios.post(path, {
          plainToken: token,
          email,
        });
      } catch (err) {
        // TODO: Set err on UI AND send to sentry.
        console.log(Object.entries(err));
        throw err;
      }
    }
  );

  useEffect(() => {
    mutate();
  }, [mutate]);

  return (
    <div
      css={`
        width: 100%;
        min-height: 100vh;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        background: #091828;
      `}
    >
      <OnboardingHeader />
      <div
        css={`
          width: 100%;
          max-width: ${120 * GU}px;
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
            Verify your email
          </h2>
        </div>
        <main
          css={`
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
          {isLoading && (
            <p
              css={`
                ${textStyle("body2")}
              `}
            >
              Verifying...
            </p>
          )}
          {isSuccess && (
            <p
              css={`
                ${textStyle("body2")}
              `}
            >
              Your email has been verified! You can now&nbsp;
              <RouterLink
                to={{
                  pathname: "/login",
                }}
                component={Link}
                external={false}
              >
                log in
              </RouterLink>
              .
            </p>
          )}
          {isError && (
            <p
              css={`
                ${textStyle("body2")}
              `}
            >
              Something went wrong while validating your email. Contact support
              if this issue persists.
            </p>
          )}
        </main>
      </div>
    </div>
  );
}
