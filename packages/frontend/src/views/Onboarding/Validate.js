import React, { useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useMutation } from "react-query";
import axios from "axios";
import "styled-components/macro";
import { useViewport } from "use-viewport";
import { Link, textStyle, useTheme, GU, RADIUS, Info } from "ui";
import OnboardingHeader from "components/OnboardingHeader/OnboardingHeader";
import env from "environment";

export default function Login() {
  const theme = useTheme();
  const { search } = useLocation();
  const { within } = useViewport();

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
      }
    }
  );

  useEffect(() => {
    mutate();
  }, []);

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
          `}
        >
          Verify your email
        </h2>
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
            Something went wrong while validating your email. Contact support if
            this issue persists.
          </p>
        )}
      </main>
    </div>
  );
}
