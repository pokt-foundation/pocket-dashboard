import React from "react";
import "styled-components/macro";
import { textStyle, GU, RADIUS } from "ui";

export default function Box({ children, title, className, ...props }) {
  return (
    <div
      css={`
        background: #1b2331;
        padding: ${2 * GU}px ${2 * GU}px;
        border-radius: ${RADIUS * 2}px;
      `}
      className={className}
      {...props}
    >
      {title && (
        <h3
          css={`
            ${textStyle("title3")}
            margin-bottom: ${3 * GU}px;
          `}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
