import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { useTransition, animated } from "react-spring";
import "styled-components/macro";
import { useTheme } from "ui/theme";
import { clamp, warnOnce } from "ui/utils";

const STROKE_WIDTH = 2;
const SIZE_DEFAULT = 100;
const RADIUS_SPACING = 8;

function labelDefault(animValue, values) {
  const parts = {
    suffix: "%",
    value: String(Math.floor(animValue * 100)),
  };

  const [highestVal] = values.sort((a, b) => b - a);
  const animPercentage = animValue * 100;
  const percentage = highestVal * 100;

  const lessThanOne =
    percentage > 0 &&
    percentage < 1 &&
    animPercentage > 0 &&
    // We know that the actual percentage is less than 1,
    // so this is to avoid a jump with ‚Äú1%‚Äù without prefix.
    animPercentage < 2;

  return lessThanOne ? { ...parts, prefix: "<", value: "1" } : parts;
}

function labelCompat(parts) {
  if (
    typeof parts === "string" ||
    typeof parts === "number" ||
    React.isValidElement(parts)
  ) {
    warnOnce(
      "MultiCircleGraph:label:string",
      "MultiCircleGraph: the function passed to the label should not " +
        "return a React node anymore: please check the MultiCircleGraph documentation."
    );
    return { value: String(parts) };
  }
  return parts;
}

function MultiCircleGraph({ color, label, size, strokeWidth, values }) {
  const theme = useTheme();
  const transitions = useTransition(values, (v) => v, {
    from: (v) => 0,
    enter: (v) => v,
  });

  if (label === undefined) {
    label = labelDefault;
  }

  const labelPart = useCallback(
    (name) => (animValue) => {
      if (typeof label !== "function") {
        return null;
      }

      const cValue = clamp(animValue);
      const parts = labelCompat(label(cValue, values));

      return (
        (parts[name] === undefined
          ? labelDefault(cValue, values)[name]
          : parts[name]) || ""
      );
    },
    [label, values]
  );

  const colorFn =
    typeof color === "function" ? color : () => color || theme.accent;

  return (
    <div
      css={`
            position: relative;
            display: flex;
            align-items: center;
            justify-content center;
            width: ${size}px;
            height: ${size}px;
          `}
    >
      {transitions.map(({ item: progressValue, _, props }, idx) => {
        const radius = (size - strokeWidth) / 2 - RADIUS_SPACING * idx;
        const length = Math.PI * 2 * radius;

        return (
          <React.Fragment key={idx}>
            <svg
              css={`
                position: absolute;
                top: 0;
                left: 0;
              `}
              width={size}
              height={size}
              viewBox={`0 0 ${size} ${size}`}
            >
              <>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  style={{ strokeWidth }}
                  fill="none"
                  stroke={theme.border}
                />
                <animated.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={length}
                  strokeWidth={strokeWidth}
                  style={{
                    stroke: colorFn(),
                    strokeDashoffset: length - progressValue * length,
                    ...props,
                  }}
                  css={`
                    transform: rotate(270deg);
                    transform-origin: 50% 50%;
                  `}
                />
              </>
            </svg>
            <div
              css={`
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                line-height: 1.2;
              `}
            >
              {typeof label !== "function"
                ? label
                : label &&
                  !idx && (
                    <div
                      css={`
                        position: absolute;
                        top: 50%;
                        left: 0;
                        right: 0;
                        transform: translateY(-50%);
                      `}
                    >
                      <div
                        css={`
                          display: flex;
                          align-items: baseline;
                          justify-content: center;
                        `}
                      >
                        <animated.div style={{ fontSize: `${size * 0.2}px` }}>
                          {labelPart("prefix")(progressValue)}
                        </animated.div>
                        <animated.div style={{ fontSize: `${size * 0.25}px` }}>
                          {labelPart("value")(progressValue)}
                        </animated.div>
                        <animated.div
                          css={`
                            display: flex;
                            color: ${theme.surfaceContentSecondary};
                          `}
                          style={{ fontSize: `${size * 0.13}px` }}
                        >
                          {labelPart("suffix")(progressValue)}
                        </animated.div>
                      </div>
                      <animated.div
                        css={`
                          position: absolute;
                          top: 100%;
                          left: 0;
                          right: 0;
                          display: flex;
                          justify-content: center;
                          color: ${theme.surfaceContentSecondary};
                        `}
                        style={{ fontSize: `${size * 0.1}px` }}
                      >
                        {labelPart("secondary")(progressValue)}
                      </animated.div>
                    </div>
                  )}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

MultiCircleGraph.propTypes = {
  color: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  size: PropTypes.number,
  strokeWidth: PropTypes.number,
  values: PropTypes.arrayOf([PropTypes.number]).isRequired,
};

MultiCircleGraph.defaultProps = {
  size: SIZE_DEFAULT,
  strokeWidth: STROKE_WIDTH,
};

export default MultiCircleGraph;
