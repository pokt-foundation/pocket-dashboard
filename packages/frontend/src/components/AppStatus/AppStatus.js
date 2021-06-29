import React from 'react'
import TokenAmount from 'token-amount'
import 'styled-components/macro'
import Box from 'components/Box/Box'
import { Spacer, Tag, textStyle, GU } from '@pokt-foundation/ui'

export default function AppStatus({ stakedTokens, maxDailyRelays }) {
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
            ${textStyle('body1')}
            font-weight: 600;
            span {
              font-weight: 400;
            }
          }
        `}
      >
        <li>
          Status
          <span>
            <Tag
              mode="new"
              uppercase={false}
              color="white"
              background="#1A4008"
            >
              Staked
            </Tag>
          </span>
        </li>
        <Spacer size={2 * GU} />
        <li>
          Amount
          <span>
            {TokenAmount.format(stakedTokens, 6, {
              symbol: 'POKT',
            })}
          </span>
        </li>
        <Spacer size={2 * GU} />
        <li>
          Max relays per day
          <span>
            {new Intl.NumberFormat('en-US', {
              notation: 'compact',
              compactDisplay: 'short',
            }).format(maxDailyRelays)}
          </span>
        </li>
      </ul>
    </Box>
  )
}
