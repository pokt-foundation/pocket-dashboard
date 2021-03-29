import React, { useMemo } from "react";
import TokenAmount from "token-amount";
import "styled-components/macro";
import Box from "components/Box/Box";
import { Spacer, textStyle, GU } from "ui";
import { getStakingStatus } from "lib/pocket-utils";

export default function AppStatus({ appOnChainStatus }) {
  const { status, staked_tokens: stakedTokens } = appOnChainStatus;

  const stakingStatus = useMemo(() => getStakingStatus(status), [status]);

  return (
    <Box
      css={`
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <ul
        css={`
          list-style: none;
          height: 100%;
          width: 100%;
          li {
            display: flex;
            justify-content: space-between;
            ${textStyle("body1")}
          }
        `}
      >
        <li>
          Status: <span>{stakingStatus}</span>
        </li>
        <Spacer size={2 * GU} />
        <li>
          Amount:{" "}
          <span>
            {TokenAmount.format(stakedTokens, 6, {
              symbol: "POKT",
            })}
          </span>
        </li>
        <Spacer size={2 * GU} />
        <li>
          Max relays per day: <span>1M</span>
        </li>
      </ul>
    </Box>
  );
}
