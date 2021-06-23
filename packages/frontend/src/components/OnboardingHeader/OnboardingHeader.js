import React from 'react'
import 'styled-components/macro'
import { textStyle, GU } from '@pokt-foundation/ui'
import PoktLogo from 'assets/poktlogo.png'

export default function OnboardingHeader() {
  return (
    <a
      href="https://pokt.network"
      rel="noopener _noreferrer"
      target="blank"
      css={`
        width: 100%;
        text-decoration: none;
      `}
    >
      <header
        css={`
          position: absolute;
          top: ${2 * GU}px;
          left: ${3 * GU}px;
          ${textStyle('title1')}
          display: flex;
          justify-content: center;
        `}
      >
        <img
          src={PoktLogo}
          alt="Pocket"
          width="100%"
          height="66"
          css={`
            max-width: ${23.5 * GU}px;
          `}
        />
        <h1
          css={`
            line-height: 1.9;
          `}
        >
          &nbsp; Dashboard
        </h1>
      </header>
    </a>
  )
}
