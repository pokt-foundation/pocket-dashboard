import React from "react";
import "styled-components/macro";
import { textStyle, GU } from "ui";

export default function NavigationBar() {
  return (
    <nav
      css={`
        display: flex;
        flex-direction: row;
        margin-top: ${5 * GU}px;
        align-items: center;
      `}
    >
      <span
        css={`
          display: inline-block;
          flex-grow: 1;
          ${textStyle("title1")}
        `}
      >
        Pocket Dashboard
      </span>
      <ul
        css={`
          list-style: none;
          li {
            display: inline-block;
          }
          li:not(:last-child) {
            margin-right: ${7 * GU}px;
          }
        `}
      >
        <li>Support</li>
        <li>Community</li>
        <li>Get an endpoint</li>
      </ul>
    </nav>
  );
}
