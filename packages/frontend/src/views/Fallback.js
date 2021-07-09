import React from 'react'
import 'styled-components/macro'
import { Button, GU, Link, Spacer, textStyle } from '@pokt-foundation/ui'
import Box from 'components/Box/Box'

export default function Fallback() {
  return (
    <div
      css={`
        width: 100vw;
        height: 100vh;
        background: #00182a;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: ${2 * GU}px;
      `}
    >
      <Box
        title="An error has ocurred."
        css={`
          max-width: ${87 * GU}px;
          background: #192332;
        `}
      >
        <p
          css={`
            ${textStyle('body2')}
            color: #fff;
          `}
        >
          Oh no, the Portal has inexplicably closed! Click Reload to try opening
          it again. If this issue persists,&nbsp;
          <Link href="https://discord.gg/uCZZkHTQjV">
            contact us on Discord.
          </Link>
        </p>
        <Spacer size={2 * GU} />
        <Button wide onClick={() => window.location.reload()}>
          Reload
        </Button>
      </Box>
    </div>
  )
}
