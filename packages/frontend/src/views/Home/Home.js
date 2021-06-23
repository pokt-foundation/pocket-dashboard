import React from 'react'
import 'styled-components/macro'
import { Button, TextInput, textStyle, GU, RADIUS } from '@pokt-foundation/ui'

export default function Home() {
  return (
    <div
      css={`
        width: 100%;
        height: 100%;
      `}
    >
      <div
        css={`
          max-width: ${96 * GU}px;
          max-height: ${78 * GU}px;
          border-radius: ${RADIUS}px;
          padding: ${5 * GU}px ${8 * GU}px;
        `}
      >
        <h2
          css={`
            ${textStyle('title2')}
          `}
        >
          Get Started
        </h2>
        <TextInput />
        <TextInput />
        <Button>Get started</Button>
      </div>
    </div>
  )
}
