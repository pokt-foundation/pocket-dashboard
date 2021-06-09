import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { animated, useTransition } from "react-spring";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import "styled-components/macro";
import {
  Button,
  ButtonBase,
  DataView,
  Help,
  IconCross,
  IconPlus,
  Spacer,
  Split,
  Switch,
  TextCopy,
  TextInput,
  springs,
  textStyle,
  GU,
} from "ui";
import Box from "components/Box/Box";
import FloatUp from "components/FloatUp/FloatUp";
import { useUserApplications } from "views/Dashboard/application-hooks";
import { log } from "lib/utils";
import env from "environment";

const SCREENS = new Map([
  [0, BasicSetup],
  [1, SecuritySetup],
]);

const APP_CONFIG_DATA_KEY = "POKT_NETWORK_APP_CONFIG_DATA";
const APP_CONFIG_SCREEN_KEY = "POKT_NETWORK_APP_CONFIG_SREEN";

const UPDATE_TYPES = new Map([
  ["UPDATE_APP_NAME", "appName"],
  ["UPDATE_SELECTED_NETWORK", "selectedNetwork"],
  ["UPDATE_WHITELISTED_USER_AGENTS", "whitelistUserAgents"],
  ["UPDATE_WHITELISTED_ORIGINS", "whitelistOrigins"],
  ["UPDATE_REQUIRE_SECRET_KEY", "secretKeyRequired"],
]);

const DEFAULT_CONFIGURE_STATE = {
  appName: "",
  selectedNetwork: "",
  whitelistUserAgents: [],
  whitelistOrigins: [],
  secretKeyRequired: false,
};

function loadConfigureState() {
  const appConfigData = localStorage.getItem(APP_CONFIG_DATA_KEY);
  const screenIndex = localStorage.getItem(APP_CONFIG_SCREEN_KEY);

  try {
    const deserializedConfigData =
      JSON.parse(appConfigData) ?? DEFAULT_CONFIGURE_STATE;
    const deserializedScreenIndex = JSON.parse(screenIndex) ?? 0;

    return {
      appConfigData: deserializedConfigData,
      screenIndex: Number(deserializedScreenIndex),
    };
  } catch (err) {
    // This might look weird at first, but we've got no good way to tell if
    // failure to deserialize this data is a browser issue, or just people
    // cleaning their localStorage data, so we just assume the happy path.
    return DEFAULT_CONFIGURE_STATE;
  }
}

function useConfigureState() {
  const [appConfigData, setAppConfigData] = useState(DEFAULT_CONFIGURE_STATE);
  const [prevScreenIndex, setPrevScreenIndex] = useState(-1);
  const [screenIndex, setScreenIndex] = useState(0);

  useEffect(() => {
    const { appConfigData, screenIndex } = loadConfigureState();

    setAppConfigData(appConfigData);
    setScreenIndex(screenIndex);
  }, []);

  const updateAppConfigData = useCallback(
    (action) => {
      const keyToUpdate = UPDATE_TYPES.get(action.type);

      if (!keyToUpdate) {
        throw new Error(`No key matching ${action.type} was found.`);
      }

      const newAppConfigData = {
        ...appConfigData,
        [keyToUpdate]: action.payload,
      };

      log("New App Config Data", newAppConfigData);

      setAppConfigData(newAppConfigData);
    },
    [appConfigData]
  );

  const incrementScreenIndex = useCallback(() => {
    setPrevScreenIndex(screenIndex);
    setScreenIndex((screenIndex) => screenIndex + 1);
  }, [screenIndex]);

  const decrementScreenIndex = useCallback(() => {
    setPrevScreenIndex(screenIndex);
    setScreenIndex((screenIndex) => screenIndex - 1);
  }, [screenIndex]);

  return {
    appConfigData,
    decrementScreenIndex,
    incrementScreenIndex,
    prevScreenIndex,
    screenIndex,
    updateAppConfigData,
  };
}

export default function Create() {
  const history = useHistory();
  const {
    appConfigData,
    decrementScreenIndex,
    incrementScreenIndex,
    prevScreenIndex,
    screenIndex,
    updateAppConfigData,
  } = useConfigureState();
  const {
    appName,
    selectedNetwork,
    whitelistOrigins,
    whitelistUserAgents,
    secretKeyRequired,
  } = appConfigData;
  const { appsData, refetchUserApps } = useUserApplications();

  const {
    isLoading: isChainsLoading,
    isError: isChainsError,
    data: chains,
  } = useQuery("/network/stakeable-chains", async function getNetworkChains() {
    const path = `${env("BACKEND_URL")}/api/network/stakeable-chains`;

    try {
      const res = await axios.get(path, {
        withCredentials: true,
      });

      const {
        data: { chains },
      } = res;

      return chains;
    } catch (err) {
      console.log("?", err);
    }
  });

  const {
    isError: isCreateError,
    isLoading: isCreateLoading,
    isSuccess: isCreateSuccess,
    mutate,
  } = useMutation(async function createApp() {
    try {
      const path = `${env("BACKEND_URL")}/api/applications`;

      const res = await axios.post(
        path,
        {
          name: appName,
          chain: selectedNetwork,
          gatewaySettings: {
            whitelistOrigins,
            whitelistUserAgents,
            secretKeyRequired,
          },
        },
        {
          withCredentials: true,
        }
      );

      await refetchUserApps();

      history.push({
        pathname: `/app/${res.data._id}`,
      });

      return res;
    } catch (err) {
      // TODO: Catch error with Sentry
    }
  });

  // useEffect(() => {
  //   if (appsData?.length) {
  //     const [userApp] = appsData;

  //     history.push(`/app/${userApp.appId}`);
  //   }
  // }, [appsData, history]);

  const ActiveScreen = useMemo(() => SCREENS.get(screenIndex) ?? null, [
    screenIndex,
  ]);

  const direction = screenIndex > prevScreenIndex ? 1 : -1;
  const transitionProps = useTransition(screenIndex, null, {
    from: {
      opacity: 0,
      position: "absolute",
      transform: `translate3d(${10 * direction}%, 0, 0)`,
    },
    enter: {
      opacity: 1,
      position: "static",
      transform: `translate3d(0%, 0, 0)`,
    },
    leave: {
      opacity: 0,
      position: "absolute",
      transform: `translate3d(${-10 * direction}%, 0, 0)`,
    },
    config: springs.smooth,
    immediate: screenIndex === 0 && prevScreenIndex === -1,
  });

  const isCreateDisabled = useMemo(
    () =>
      isChainsError ||
      isChainsLoading ||
      isCreateError ||
      isCreateLoading ||
      isCreateSuccess ||
      !appName ||
      !selectedNetwork,
    [
      appName,
      selectedNetwork,
      isChainsError,
      isChainsLoading,
      isCreateError,
      isCreateLoading,
      isCreateSuccess,
    ]
  );

  return (
    <FloatUp
      fallback={() => <p>Loading...</p>}
      loading={isChainsLoading}
      content={() => (
        <div
          css={`
            width: 100%;
            position: relative;
            overflow-x: hidden;
          `}
        >
          {transitionProps.map(({ _, key, props }) => (
            <animated.div
              key={key}
              style={props}
              css={`
                top: 0;
                left: 0;
                right: 0;
              `}
            >
              <ActiveScreen
                data={appConfigData}
                decrementScreen={decrementScreenIndex}
                incrementScreen={incrementScreenIndex}
                onCreateApp={mutate}
                isCreateDisabled={isCreateDisabled}
                updateData={updateAppConfigData}
                chains={chains}
              />
            </animated.div>
          ))}
        </div>
      )}
    />
  );
}

function BasicSetup({
  data,
  incrementScreen,
  isCreateDisabled,
  onCreateApp,
  updateData,
  chains,
}) {
  const onSwitchClick = useCallback(
    (chainId) => {
      if (data.selectedNetwork && data.selectedNetwork === chainId) {
        updateData({ type: "UPDATE_SELECTED_NETWORK", payload: "" });
      } else {
        updateData({ type: "UPDATE_SELECTED_NETWORK", payload: chainId });
      }
    },
    [data, updateData]
  );

  return (
    <>
      <Split
        primary={
          <>
            <Box title="App name">
              <TextInput
                value={data.appName ?? ""}
                onChange={(e) =>
                  updateData({
                    type: "UPDATE_APP_NAME",
                    payload: e.target.value,
                  })
                }
                placeholder="New App Name"
                wide
              />
            </Box>
            <Spacer size={2 * GU} />
            <Box title="Available networks">
              <DataView
                fields={["Selected", "Network", "ID", "Ticker"]}
                entries={chains}
                renderEntry={({
                  description,
                  id,
                  ticker,
                  isAvailableForStaking,
                }) => [
                  <Switch
                    onChange={() => onSwitchClick(id)}
                    checked={data.selectedNetwork === id}
                    disabled={!isAvailableForStaking}
                  />,
                  description,
                  id,
                  ticker,
                ]}
              />
            </Box>
          </>
        }
        secondary={
          <>
            <Button
              wide
              onClick={onCreateApp}
              disabled={isCreateDisabled}
              mode="strong"
            >
              Launch Application
            </Button>
            <Spacer size={2 * GU} />
            <Button wide onClick={() => incrementScreen()}>
              Set up app security
            </Button>
            <Spacer size={2 * GU} />
            <Box title="Free-tier info">
              <ul
                css={`
                  list-style: none;
                  height: 100%;
                  li {
                    display: flex;
                    justify-content: space-between;
                  }
                  li:not(:last-child) {
                    margin-bottom: ${2 * GU}px;
                  }
                `}
              >
                <li>
                  Amount of POKT: <span>25,000</span>
                </li>
                <li>
                  Max relays per day: <span>1M</span>
                </li>
              </ul>
            </Box>
          </>
        }
      />
    </>
  );
}

function SecuritySetup({ data, decrementScreen, updateData }) {
  const [userAgent, setUserAgent] = useState("");
  const [origin, setOrigin] = useState("");

  const onWhitelistedUserAgentDelete = useCallback(
    (userAgent) => {
      const whitelistedUserAgents = data.whitelistUserAgents ?? [];

      const filteredWhitelistedUserAgents = whitelistedUserAgents.filter(
        (u) => u !== userAgent
      );

      updateData({
        type: "UPDATE_WHITELISTED_USER_AGENTS",
        payload: filteredWhitelistedUserAgents,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateData]
  );
  const onWhitelistedOriginDelete = useCallback(
    (origin) => {
      const whitelistedOrigins = data.whitelistOrigins ?? [];

      const filteredWhitelistedOrigins = whitelistedOrigins.filter(
        (o) => o !== origin
      );

      updateData({
        type: "UPDATE_WHITELISTED_ORIGINS",
        payload: filteredWhitelistedOrigins,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [updateData]
  );
  const setWhitelistedUserAgent = useCallback(() => {
    const whitelistedUserAgents = data.whitelistUserAgents ?? [];

    if (whitelistedUserAgents.indexOf(userAgent) !== -1) {
      return;
    }

    updateData({
      type: "UPDATE_WHITELISTED_USER_AGENTS",
      payload: [...whitelistedUserAgents, userAgent],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, updateData, userAgent]);
  const setWhitelistedOrigin = useCallback(() => {
    const whitelistedOrigins = data.whitelistOrigins ?? [];

    if (whitelistedOrigins.indexOf(origin) !== -1) {
      return;
    }

    updateData({
      type: "UPDATE_WHITELISTED_ORIGINS",
      payload: [...whitelistedOrigins, origin],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, origin, updateData]);

  return (
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
              additional secret key and/or whitelist user agents and origins.
              For more information take a look at the Pocket Gateway Docs.
            </p>
          </Box>
        }
        secondary={
          <>
            <Button wide onClick={() => decrementScreen()}>
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
                  Turn this on if you wanna have an "extra" layer of security
                  for all of your requests. You'll have to send a password with
                  each request that we will verify. You'll have access to this
                  key once you create the application.
                </Help>
              </div>
              <Switch
                checked={data.secretKeyRequired ?? false}
                onChange={() =>
                  updateData({
                    type: "UPDATE_REQUIRE_SECRET_KEY",
                    payload: !data.secretKeyRequired,
                  })
                }
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
          {data.whitelistUserAgents.map((agent) => (
            <li key={agent}>
              <TextCopy
                onCopy={() => onWhitelistedUserAgentDelete(agent)}
                adornment={<IconCross />}
                value={agent}
                css={`
                  width: 100%;
                  padding-left: 0;
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
          {data.whitelistOrigins.map((origin) => (
            <li key={origin}>
              <TextCopy
                onCopy={() => onWhitelistedOriginDelete(origin)}
                value={origin}
                adornment={<IconCross />}
                css={`
                  width: 100%;
                  padding-left: 0;
                `}
              />
            </li>
          ))}
        </ul>
      </Box>
    </>
  );
}
