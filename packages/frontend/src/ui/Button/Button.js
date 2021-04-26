import React, { useMemo } from "react";
import PropTypes from "prop-types";
import "styled-components/macro";
import { textStyle, GU, RADIUS } from "ui/style";
import { useTheme } from "ui/theme";
import { warn, warnOnce, unselectable } from "ui/utils";
import ButtonBase from "../ButtonBase/ButtonBase";

// Base styles related to every size.
// See src/icons/icon-size.js for the corresponding icon sizes.
const SIZE_STYLES = {
  medium: {
    textStyleName: "body3",
    height: 5 * GU,
    padding: 3 * GU,
    iconPadding: 2 * GU,
    minWidth: 14.5 * GU,
    middleSpace: 1 * GU,
  },
  small: {
    textStyleName: "body3",
    height: 4 * GU,
    padding: 2 * GU,
    iconPadding: 1.5 * GU,
    minWidth: 13 * GU,
    middleSpace: 1 * GU,
  },
  mini: {
    textStyleName: "body3",
    height: 3 * GU,
    padding: 1.5 * GU,
    iconPadding: 1 * GU,
    minWidth: 9.25 * GU,
    middleSpace: 0.5 * GU,
  },
};

function getPadding(size, displayIcon, displayLabel) {
  const { padding, iconPadding } = SIZE_STYLES[size];

  if (displayIcon && !displayLabel) {
    return "0";
  }

  if (displayIcon && displayLabel) {
    return `0 ${padding}px 0 ${iconPadding}px`;
  }

  return `0 ${padding}px`;
}

function getWidth(size, displayIconOnly, wide) {
  const { height } = SIZE_STYLES[size];

  if (wide) {
    return "100%";
  }

  if (displayIconOnly) {
    return `${height}px`;
  }

  return "auto";
}

function getMinWidth(size, displayLabelOnly) {
  const { minWidth } = SIZE_STYLES[size];

  return displayLabelOnly ? `${minWidth}px` : "0";
}

// CSS styles related to the current size
function sizeStyles(size, wide, displayIcon, displayLabel) {
  const { height, textStyleName, middleSpace } = SIZE_STYLES[size];

  return {
    height: `${height}px`,
    middleSpace: displayIcon && displayLabel ? `${middleSpace}px` : "0",
    minWidth: getMinWidth(size, !displayIcon && displayLabel),
    padding: getPadding(size, displayIcon, displayLabel),
    textStyleCss: textStyle(textStyleName),
    width: getWidth(size, displayIcon && !displayLabel, wide),
  };
}

// CSS styles related to the current mode
function modeStyles(theme, mode, disabled) {
  if (disabled) {
    return {
      background: theme.disabled,
      color: theme.disabledContent,
      iconColor: theme.disabledContent,
      border: "0",
    };
  }
  if (mode === "strong") {
    return {
      background: theme.accent,
      color: theme.accentContent,
      iconColor: theme.accentContent,
      border: "0",
    };
  }

  if (mode === "positive") {
    return {
      background: theme.positive,
      color: theme.positiveContent,
      iconColor: theme.positiveContent,
      border: "0",
    };
  }

  if (mode === "negative") {
    return {
      background: theme.negative,
      color: theme.negativeContent,
      iconColor: theme.negativeContent,
      border: "0",
    };
  }

  return {
    background: theme.surfaceInteractive,
    color: theme.surfaceContent,
    iconColor: theme.surfaceIcon,
    border: `1px solid ${theme.accent}`,
  };
}

function BasicButton({
  children,
  disabled,
  display,
  icon,
  iconOnly,
  innerRef,
  label,
  mode,
  size,
  wide,
  ...props
}) {
  // backward compatibility and deprecated props
  if (iconOnly) {
    warnOnce(
      "Button:iconOnly",
      `Button: "iconOnly" is deprecated, please use "display".`
    );
    display = "icon";
  }
  if (mode === "outline" || mode === "secondary") {
    warnOnce(
      "Button:mode",
      `Button: the mode "${mode}" is deprecated, please use "normal".`
    );
    mode = "normal";
  }
  if (size === "normal" || size === "large") {
    warnOnce(
      "Button:size",
      `Button: the size "${size}" is deprecated, please use "medium".`
    );
    size = "medium";
  }

  // prop warnings
  if (display === "icon" && !icon) {
    warn(`Button: the display "icon" was used without providing an icon.`);
  }
  if (!children && !label) {
    warn("Button: please provide a label.");
  }

  const theme = useTheme();

  if (display === "auto") {
    display = "all";
  }

  const displayIcon = icon && (display === "all" || display === "icon");
  const displayLabel = label && (display === "all" || display === "label");

  // Mode styles
  const { background, color, iconColor, border } = useMemo(
    () => modeStyles(theme, mode, disabled),
    [mode, theme, disabled]
  );

  // Size styles
  const {
    height,
    middleSpace,
    minWidth,
    padding,
    textStyleCss,
    width,
  } = useMemo(() => sizeStyles(size, wide, displayIcon, displayLabel), [
    size,
    wide,
    displayIcon,
    displayLabel,
  ]);

  // Use the label as a title when only the icon is displayed
  if (displayIcon && !displayLabel && label && typeof label === "string") {
    props.title = label;
  }

  return (
    <ButtonBase
      ref={innerRef}
      focusRingSpacing={border === "0" ? 0 : 1}
      focusRingRadius={RADIUS}
      disabled={disabled}
      {...props}
      css={`
        display: ${wide ? "flex" : "inline-flex"};
        align-items: center;
        justify-content: center;
        width: ${width};
        height: ${height};
        min-width: ${minWidth};
        padding: ${padding};
        ${textStyleCss};
        ${unselectable};
        background: ${background};
        color: ${color};
        white-space: nowrap;
        border: ${border};
        box-shadow: ${disabled ? "none" : "0 1px 3px rgba(0, 0, 0, 0.1)"};
        transition-property: transform, box-shadow;
        transition-duration: 50ms;
        transition-timing-function: ease-in-out;
        &:active {
          transform: ${disabled ? "none" : "translateY(1px)"};
          box-shadow: ${disabled ? "none" : "0px 1px 2px rgba(0, 0, 0, 0.08)"};
        }
      `}
    >
      {children || (
        <React.Fragment>
          {displayIcon && (
            <span
              css={`
                position: relative;
                top: -1px;
                display: flex;
                color: ${iconColor};
                margin-right: ${middleSpace};
              `}
            >
              {icon}
            </span>
          )}
          {displayLabel && { label }}
        </React.Fragment>
      )}
    </ButtonBase>
  );
}

BasicButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  display: PropTypes.oneOf(["auto", "all", "icon", "label"]),
  icon: PropTypes.node,
  innerRef: PropTypes.any,
  label: PropTypes.string,
  mode: PropTypes.oneOf(["normal", "strong", "positive", "negative"]),
  size: PropTypes.oneOf(["medium", "small", "mini"]),
  wide: PropTypes.bool,
};

BasicButton.defaultProps = {
  disabled: false,
  display: "auto",
  mode: "normal",
  size: "medium",
  wide: false,
};

const Button = React.forwardRef((props, ref) => (
  <BasicButton innerRef={ref} {...props} />
));

export default Button;
