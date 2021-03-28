import React, { useCallback, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import axios from "axios";
import "styled-components/macro";
import {
  Button,
  Split,
  Spacer,
  Switch,
  Table,
  TableRow,
  TableHeader,
  TableCell,
  GU,
} from "ui";
import Box from "components/Box/Box";
import FloatUp from "components/FloatUp/FloatUp";
import { useUserApplications } from "views/Dashboard/application-hooks";
import env from "environment";

export default function BasicSetup({ appData }) {
  const [selectedChain, setSelectedChain] = useState("");
  const history = useHistory();
  const { appId } = useParams();
  const { refetchUserApps } = useUserApplications();
  const { isLoading: isChainsLoading, data: chains } = useQuery(
    "/network/chains",
    async function getNetworkChains() {
      const path = `${env("BACKEND_URL")}/api/network/chains`;

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
    }
  );
  const { isLoading: isSwitchLoading, mutate } = useMutation(
    async function switchChains() {
      console.log(selectedChain, appId);
      const path = `${env("BACKEND_URL")}/api/applications/switch/${appId}`;

      try {
        console.log(path);

        const res = await axios.post(
          path,
          {
            chain: selectedChain,
          },
          {
            withCredentials: true,
          }
        );

        console.log(res);

        const {
          data: { _id },
        } = res;

        await refetchUserApps();

        history.push(`/app/${_id}`);
      } catch (err) {
        console.log("??", Object.entries(err));
      }
    }
  );
  const onSwitchClick = useCallback(
    (id) => {
      setSelectedChain(id === selectedChain ? "" : id);
    },
    [selectedChain]
  );

  const { chain: activeAppChain } = appData;

  const isSubmitDisabled = useMemo(() => isSwitchLoading || !selectedChain, [
    isSwitchLoading,
    selectedChain,
  ]);

  return (
    <FloatUp
      fallback={() => <p>Loading...</p>}
      loading={isChainsLoading}
      content={() => (
        <Split
          primary={
            <>
              <Box title="Available networks">
                <Table
                  noSideBorders
                  noTopBorders
                  css={`
                    background: transparent;
                  `}
                  header={
                    <>
                      <TableRow>
                        <TableHeader title="Selected" />
                        <TableHeader title="Network" />
                        <TableHeader title="Ticker" />
                        <TableHeader title="Chain ID" />
                      </TableRow>
                    </>
                  }
                >
                  {chains.map(
                    ({ description, id, ticker, isAvailableForStaking }) => (
                      <TableRow key={id}>
                        <TableCell>
                          <Switch
                            disabled={
                              !isAvailableForStaking || activeAppChain === id
                            }
                            onChange={() => onSwitchClick(id)}
                            checked={selectedChain === id}
                          />
                        </TableCell>
                        <TableCell>{description}</TableCell>
                        <TableCell>{ticker}</TableCell>
                        <TableCell>{id}</TableCell>
                      </TableRow>
                    )
                  )}
                </Table>
              </Box>
            </>
          }
          secondary={
            <>
              <Button
                wide
                mode="strong"
                disabled={isSubmitDisabled}
                onClick={mutate}
              >
                Save changes
              </Button>
              <Spacer size={2 * GU} />
              <Button wide onClick={() => history.goBack()}>
                Go back
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
      )}
    />
  );
}