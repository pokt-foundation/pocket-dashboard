import React, { useMemo } from "react";
import "styled-components/macro";
import { useViewport } from "use-viewport";
import { IconThickCross, Spacer, useTheme, GU, RADIUS } from "ui";
import { textStyle } from "ui/style";
import { IconInfo } from "ui/icons";

function useModeColor(mode) {
  const theme = useTheme();

  if (mode === "error") {
    return `linear-gradient(270deg, ${theme.surface} 36.46%, #3F0B0B 100%)`;
  }
  if (mode === "warning") {
    return `linear-gradient(270deg, ${theme.surface} 36.46%, #816110 100%)`;
  }
  if (mode === "info") {
    return `linear-gradient(270deg, ${theme.surface} 36.46%, #104A64 100%)`;
  }

  return `background: ${theme.surface}`;
}

export default function Banner({ children, mode = "info", title }) {
  const modeBackground = useModeColor(mode);
  const { within } = useViewport();
  const theme = useTheme();

  const titleColor = useMemo(() => {
    if (mode === "error") {
      return theme.negativeSurfaceContent;
    }

    if (mode === "info") {
      return theme.accent;
    }

    if (mode === "warning") {
      return theme.yellow;
    }
  }, [mode, theme]);

  const modeIcon = useMemo(() => {
    if (mode === "error") {
      return <IconThickCross size="mini" />;
    }

    if (mode === "info") {
      return <IconInfo size="mini" />;
    }

    if (mode === "warning") {
      return <IconInfo size="mini" />;
    }
  }, [mode]);

  const compactMode = within(-1, "medium");

  return (
    <div
      css={`
        width: 100%;
        min-height: ${25 * GU};
        background: ${modeBackground};
        display: grid;
        grid-template-columns: ${compactMode ? "1fr" : `${12 * GU}px 1fr`};
        padding: ${3 * GU}px ${4 * GU}px;
        padding-left: 0;
        border-radius: ${RADIUS * 2}px;
      `}
    >
      {!compactMode && (
        <div
          css={`
            width: ${12 * GU}px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
          `}
        >
          <div
            css={`
              background: ${titleColor};
              width: ${4 * GU}px;
              height: ${4 * GU}px;
              border-radius: 50% 50%;
              display: flex;
              justify-content: center;
              align-items: center;
            `}
          >
            {modeIcon}
          </div>
        </div>
      )}
      <div
        css={`
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        `}
      >
        <h2
          css={`
            ${textStyle("title4")} font-weight: bold;
            color: ${titleColor};
          `}
        >
          {title}
        </h2>
        <Spacer size={2 * GU} />
        <p
          css={`
            ${textStyle("body3")}
          `}
        >
          {children}
        </p>
      </div>
    </div>
  );
}
