import React from "react";
import "styled-components/macro";
import { GU } from "ui";
import NavigationBar from "views/Dashboard/NavigationBar";
import MenuPanel from "components/MenuPanel/MenuPanel";

export default function DashboardView({ children }) {
  return (
    <div
      css={`
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: row;
        background: #051829;
        color: white;
        overflow-x: hidden;
      `}
    >
      <MenuPanel />
      <main
        css={`
          height: auto;
          overflow-y: scroll;
          flex-grow: 1;
          max-width: 1152px;
          margin: 0 auto;
          padding-left: ${4 * GU}px;
          padding-right: ${4 * GU}px;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        `}
      >
        <div
          css={`
            /* TODO: This is a bit smelly. Might wanna adopt a spacer component to avoid leaky margins. */
            margin-bottom: ${9 * GU}px;
            overflow-x: hidden;
          `}
        >
          <NavigationBar />
        </div>
        {children}
      </main>
    </div>
  );
}
