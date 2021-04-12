import React from "react";
import PropTypes from "prop-types";
import "styled-components/macro";
import { Inside, useInside } from "use-inside";
import { GU, RADIUS, textStyle } from "ui/style";
import { useTheme } from "ui/theme";
import { useLayout } from "ui/Layout/Layout";

function Box({ heading, children, padding, ...props }) {
  const theme = useTheme();
  const [insideSplitPrimary] = useInside("Split:primary");
  const { layoutName } = useLayout();
  const fullWidth = layoutName === "small";

  const defaultPadding = (fullWidth ? 2 : insideSplitPrimary ? 5 : 3) * GU;

  const contentPadding = padding === undefined ? defaultPadding : padding;

  return (
    <Inside name="Box">
      <div
        as={heading ? "section" : "div"}
        css={`
          position: relative;
          border-radius: ${fullWidth ? 0 : RADIUS}px;
          border-style: solid;
          border-width: 0px;
          background: ${theme.surface};
          color: ${theme.surfaceContent};
          & + & {
            margin-top: ${2 * GU}px;
          }
        `}
        {...props}
      >
        {heading && (
          <h1
            css={`
              display: flex;
              align-items: center;
              height: ${4 * GU}px;
              padding: 0 ${defaultPadding}px;
              border-bottom: 1px solid ${theme.tableBorder};

              // We pass the text style and color to the heading children, so
              // that a node structure can inherit from it. Most components set
              // their color and text style, but it is something to be aware of.
              color: ${theme.surfaceContentSecondary};
              ${textStyle("label2")};
            `}
          >
            <Inside name="Box:heading">{heading}</Inside>
          </h1>
        )}
        <div
          css={`
            padding: ${contentPadding}px;
          `}
        >
          <div>
            <Inside name="Box:content">{children}</Inside>
          </div>
        </div>
      </div>
    </Inside>
  );
}

Box.propTypes = {
  heading: PropTypes.node,
  children: PropTypes.node,
  padding: PropTypes.oneOfType([
    PropTypes.number,

    // deprecated
    PropTypes.bool,
  ]),
};

export default Box;
