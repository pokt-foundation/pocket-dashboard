import React from "react";
import "styled-components/macro";
import { textStyle, GU, RADIUS } from "ui";

const DEFAULT_PADDING = 2 * GU;

export default function Box({ children, title, className, padding, ...props }) {
  return (
    <div
      css={`
        position: relative;
        background: #1b2331;
        padding: ${padding[0]}px ${padding[1]}px ${padding[2]}px ${padding[3]}px;
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

Box.defaultProps = {
  padding: Array(4).fill(DEFAULT_PADDING),
};
