import React from "react";
import "styled-components/macro";
import { Spacer, GU } from "ui";
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
      `}
    >
      <MenuPanel />
      <main
        css={`
          height: auto;
          overflow-y: scroll;
          overflow-x: hidden;
          flex-grow: 1;
          max-width: 1152px;
          margin: 0 auto;
          padding-left: ${2 * GU}px;
          padding-right: ${2 * GU}px;
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        `}
      >
        <NavigationBar />
        <Spacer size={5 * GU} />
        {children}
      </main>
    </div>
  );
}
