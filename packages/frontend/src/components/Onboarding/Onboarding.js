import React from 'react'
import { useViewport } from 'use-viewport'
import { Spacer, useTheme, GU } from '@pokt-foundation/ui'
import 'styled-components/macro'
import OnboardingHeader from 'components/OnboardingHeader/OnboardingHeader'
import PortalLogo from 'assets/portal_logo.svg'

export default function Onboarding({ children }) {
  const theme = useTheme()
  const { within } = useViewport()
  const compactMode = within(-1, 'medium')

  return (
    <div
      css={`
        position: relative;
        width: 100%;
        min-height: 100vh;
        position: relative;
        background: linear-gradient(
          126.96deg,
          ${theme.backgroundGradient1} -5.41%,
          ${theme.backgroundGradient2} 101.86%
        );
      `}
    >
      <Spacer size={compactMode ? 1 * GU : 6.5 * GU} />
      <OnboardingHeader />
      <Spacer size={4 * GU} />
      <div
        css={`
          height: 100%;
          display: grid;
          grid-template-columns: 50% 1fr;
          grid-template-rows: 1fr;
          grid-column-gap: 32px;
          grid-row-gap: 0px;
          align-items: center;
          ${compactMode &&
          `
            grid-template-columns: 1fr;
            grid-column-gap: 0px;
          `}
          max-width: ${144 * GU}px;
          margin: 0 auto;
        `}
      >
        <div
          css={`
            grid-column-start: 1;
            align-self: center;
            justify-self: center;
            width: 100%;
            max-width: ${62 * GU}px;
            height: 100%;
          `}
        >
          <div
            css={`
              grid-column-start: 1;
              align-self: center;
              justify-self: center;
              width: 100%;
              max-width: ${62 * GU}px;
              height: 100%;
              padding: ${1 * GU}px;
            `}
          >
            <Spacer size={3 * GU} />
            {children}
          </div>
        </div>
        {!compactMode && (
          <img
            src={PortalLogo}
            alt="Portal Logo"
            css={`
              grid-column-start: 2;
              align-self: start;
              height: 100%;
              max-height: ${72 * GU}px;
              width: 100%;
            `}
          />
        )}
      </div>
    </div>
  )
}
