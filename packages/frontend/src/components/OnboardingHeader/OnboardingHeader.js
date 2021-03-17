import React from "react";
import "styled-components/macro";
import { textStyle, GU } from "ui";

export default function OnboardingHeader() {
  return (
    <header
      css={`
        position: absolute;
        top: ${2 * GU}px;
        left: ${3 * GU}px;
        ${textStyle("title1")}
      `}
    >
      <h1>Pocket Dashboard</h1>
    </header>
  );
}
