import React from "react";
import "styled-components/macro";
import { Button, GU, Link, Spacer, textStyle } from "ui";
import Box from "components/Box/Box";

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
            ${textStyle("body2")}
            color: #fff;
          `}
        >
          Oh no! Something has gone wrong while you were using our Dashboard.
          Our team has been notified and will triage this issue soon. If this
          issue persists, you can contact our team on{" "}
          <Link href="https://discord.gg/uCZZkHTQjV">Discord</Link> and we'll
          help you out as soon as possible.
        </p>
        <Spacer size={2 * GU} />
        <Button wide mode="strong" onClick={() => window.location.reload()}>
          Reload
        </Button>
      </Box>
    </div>
  );
}
