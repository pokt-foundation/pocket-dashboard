import React from "react";
import "styled-components/macro";
import Box from "components/Box/Box";
import { Spacer, textStyle, GU } from "ui";

export default function AppStatus() {
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
          Status: <span>Staked</span>
        </li>
        <Spacer size={2 * GU} />
        <li>
          Amount: <span>2,000,000 POKT</span>
        </li>
        <Spacer size={2 * GU} />
        <li>
          Max relays per day: <span>1M</span>
        </li>
      </ul>
    </Box>
  );
}
