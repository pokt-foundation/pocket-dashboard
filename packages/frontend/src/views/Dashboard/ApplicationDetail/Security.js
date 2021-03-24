import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useMutation } from "react-query";
import axios from "axios";
import "styled-components/macro";
import {
  Button,
  ButtonBase,
  IconPlus,
  Help,
  Spacer,
  Split,
  Switch,
  TextCopy,
  TextInput,
  textStyle,
  GU,
} from "ui";
import Box from "components/Box/Box";
import { log } from "lib/utils";
import FloatUp from "components/FloatUp/FloatUp";
import env from "environment";

const DEFAULT_CONFIGURE_STATE = {
  whitelistUserAgents: [],
  whitelistOrigins: [],
  secretKeyRequired: false,
};

export default function Security({
  appData,
  data = DEFAULT_CONFIGURE_STATE,
  decrementScreen,
  updateData,
}) {
  const [origin, setOrigin] = useState("");
  const [origins, setOrigins] = useState([]);
  const [secretKeyRequired, setSecretKeyRequired] = useState(false);
  const [userAgent, setUserAgent] = useState("");
  const [userAgents, setUserAgents] = useState([]);
  const history = useHistory();

  useEffect(() => {
    setOrigins((origins) => {
      return appData.gatewaySettings.whitelistOrigins.length
        ? [...appData?.gatewaySettings?.whitelistOrigins, ...origins]
        : [...origins];
    });
    setUserAgents((agents) =>
      appData?.gatewaySettings?.whitelistOrigins.length
        ? [...appData?.gatewaySettings?.whitelistUserAgents, ...agents]
        : [...agents]
    );
    console.log(appData, "wue");
  }, [appData]);

  const { isLoading, isError, isSuccess, mutate } = useMutation(
    async function updateApplicationSettings() {
      const path = `${env("BACKEND_URL")}/api/applications/${appData._id}`;

      try {
        const res = await axios.put(
          path,
          {
            gatewaySettings: {
              whitelistOrigins: origins,
              whitelistUserAgents: userAgents,
              secretKeyRequired,
            },
          },
          {
            withCredentials: true,
          }
        );

        history.goBack();
      } catch (err) {
        // TODO: Log with sentry
        console.log("err", err);
      }
    }
  );

  const onSecretKeyRequiredChange = useCallback(() => {
    setSecretKeyRequired((r) => !r);
  }, []);
  const setWhitelistedUserAgent = useCallback(() => {
    setUserAgents((userAgents) => [...userAgents, userAgent]);
    setUserAgent("");
  }, [userAgent]);

  const setWhitelistedOrigin = useCallback(() => {
    setOrigins((origins) => [...origins, origin]);
    setOrigin("");
  }, [origin]);

  return (
    <FloatUp
      content={() => (
        <>
          <Split
            primary={
              <Box>
                <p
                  css={`
                    ${textStyle("body2")}
                    margin-bottom: ${2 * GU}px;
                  `}
                >
                  To maximize security for your application, you may add an
                  additional secret key and/or whitelist user agents and
                  origins. For more information take a look at the Pocket
                  Gateway Docs.
                </p>
                <Spacer size={2 * GU} />
                <p>
                  Make sure to configure your user-agents and origins properly
                  to protect your endpoints against unwanted users.
                </p>
                <Spacer size={1 * GU} />
              </Box>
            }
            secondary={
              <>
                <Button wide mode="strong" onClick={mutate}>
                  Save changes
                </Button>
                <Spacer size={2 * GU} />
                <Button wide onClick={() => history.goBack()}>
                  Go back
                </Button>
                <Spacer size={2 * GU} />
                <Box
                  css={`
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                  `}
                >
                  <div
                    css={`
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    `}
                  >
                    <h3
                      css={`
                        ${textStyle("body2")}
                      `}
                    >
                      Secret key required
                    </h3>
                    <Spacer size={1 * GU} />
                    <Help hint="What is this?">
                      Turn this on if you wanna have an "extra" layer of
                      security for all of your requests. You'll have to send a
                      password with each request that we will verify. You'll
                      have access to this key once you create the application.
                    </Help>
                  </div>
                  <Switch
                    checked={secretKeyRequired}
                    onChange={onSecretKeyRequiredChange}
                  />
                </Box>
              </>
            }
          />
          <Spacer size={2 * GU} />
          <Box
            title="Whitelisted user-agents"
            css={`
              h3 {
                margin-bottom: ${1 * GU}px;
              }
              margin-bottom: ${3 * GU}px;
            `}
          >
            <TextInput
              wide
              value={userAgent}
              onChange={(e) => setUserAgent(e.target.value)}
              adornment={
                <ButtonBase onClick={setWhitelistedUserAgent}>
                  <IconPlus />
                </ButtonBase>
              }
              adornmentPosition="end"
            />
            <ul
              css={`
                list-style: none;
                margin-top: ${2 * GU}px;
                li:not(:last-child) {
                  margin-bottom: ${2 * GU}px;
                }
              `}
            >
              {userAgents.map((agent) => (
                <li key={agent}>
                  <TextCopy
                    onCopy={() => log("killao")}
                    value={agent}
                    css={`
                      width: 100%;
                    `}
                  />
                </li>
              ))}
            </ul>
          </Box>
          <Box
            title="Whitelisted origins"
            css={`
              h3 {
                margin-bottom: ${1 * GU}px;
              }
            `}
          >
            <TextInput
              wide
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              adornment={
                <ButtonBase onClick={setWhitelistedOrigin}>
                  <IconPlus />
                </ButtonBase>
              }
              adornmentPosition="end"
            />
            <ul
              css={`
                list-style: none;
                margin-top: ${2 * GU}px;
                li:not(:last-child) {
                  margin-bottom: ${2 * GU}px;
                }
              `}
            >
              {origins.map((origin) => (
                <li key={origin}>
                  <TextCopy
                    onCopy={() => log("killao")}
                    value={origin}
                    css={`
                      width: 100%;
                    `}
                  />
                </li>
              ))}
            </ul>
          </Box>
        </>
      )}
    />
  );
}
