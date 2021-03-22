import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Spring } from "react-spring/renderprops";
import "styled-components/macro";
import PropTypes from "ui/prop-types";
import { springs } from "ui/style";
import { unselectable } from "ui";

const LABELS_HEIGHT = 30;
const WIDTH_DEFAULT = 300;

function useMeasuredWidth() {
  const ref = useRef();
  const [measuredWidth, setMeasuredWidth] = useState(WIDTH_DEFAULT);

  const onResize = useCallback(() => {
    if (ref.current) {
      setMeasuredWidth(ref.current.clientWidth);
    }
  }, []);

  const onRef = useCallback(
    (element) => {
      ref.current = element;
      onResize();
    },
    [onResize]
  );

  useEffect(() => {
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onResize]);

  return [measuredWidth, onRef];
}

function LineChart({
  animDelay,
  borderColor,
  color,
  dotRadius,
  height,
  label,
  labelColor,
  lines: linesProps,
  renderCheckpoints,
  reset,
  springConfig,
  total,
  width: widthProps,
  ...props
}) {
  const [width, onSvgRef] = useMeasuredWidth();

  const lines = useMemo(() => {
    return linesProps.map((lineOrValues) =>
      Array.isArray(lineOrValues) ? { values: lineOrValues } : lineOrValues
    );
  }, [linesProps]);

  // the count of provided values
  const valuesCount = useMemo(() => {
    // All the values have the same length, so we can use the first one.
    return lines[0] ? lines[0].values.length : 0;
  }, [lines]);

  // the total amount of values
  const totalCount = useMemo(() => {
    // If no total is provided, the total is the number of provided values.
    return total > 0 && total > valuesCount ? total : valuesCount;
  }, [valuesCount, total]);

  const getX = useCallback(
    (index) => {
      return (width / Math.max(1, totalCount - 1)) * index;
    },
    [width, totalCount]
  );

  const getY = useCallback(
    (percentage, progress, height) => {
      const padding = dotRadius + 2;

      return height - padding - (height - padding * 2) * percentage * progress;
    },
    [dotRadius]
  );

  const getLabelPosition = useCallback((index, length) => {
    if (index === 0) {
      return "start";
    }
    if (index === length - 1) {
      return "end";
    }
    return "middle";
  }, []);

  const labels =
    label && totalCount > 0 ? [...Array(totalCount).keys()].map(label) : null;

  const chartHeight = height - (labels ? LABELS_HEIGHT : 0);

  return (
    <Spring
      from={{ progress: 0 }}
      to={{ progress: 1 }}
      config={springConfig}
      delay={animDelay}
      reset={reset}
    >
      {({ progress }) => (
        <svg
          ref={onSvgRef}
          viewBox={`0 0 ${width} ${height}`}
          width={widthProps || "auto"}
          height="auto"
          css="display: block"
          {...props}
        >
          <g mask="url(#chart-mask)">
            {totalCount > 0 && (
              <path
                d={`
                  ${[...new Array(totalCount - 1)].reduce(
                    (path, _, index) =>
                      `${path} M ${getX(index)},${chartHeight} l 0,-8`,
                    ""
                  )}
                `}
                stroke={borderColor}
                strokeWidth="1"
              />
            )}
            {lines.map((line, lineIndex) => (
              <g key={`line-plot-${line.id || lineIndex}`}>
                <path
                  d={`
                    M
                    ${getX(0)},
                    ${getY(line.values[0], progress, chartHeight)}

                    ${line.values
                      .slice(1)
                      .map(
                        (val, index) =>
                          `L
                           ${getX((index + 1) * progress)},
                           ${getY(val, progress, chartHeight)}
                          `
                      )
                      .join("")}
                  `}
                  fill="transparent"
                  stroke={line.color || color(lineIndex, { lines })}
                  strokeWidth="2"
                />
                {renderCheckpoints &&
                  line.values
                    .slice(1, -1)
                    .map((val, index) => (
                      <circle
                        key={index}
                        cx={getX(index + 1) * progress}
                        cy={getY(val, progress, chartHeight)}
                        r={dotRadius}
                        fill="white"
                        stroke={line.color || color(lineIndex, { lines })}
                        strokeWidth="1"
                      />
                    ))}
              </g>
            ))}
          </g>
          {labels && (
            <g transform={`translate(0,${chartHeight})`}>
              {labels.map((label, index) => (
                <text
                  key={index}
                  x={getX(index)}
                  y={LABELS_HEIGHT / 2}
                  textAnchor={getLabelPosition(index, labels.length)}
                  fill={labelColor}
                  css={`
                    alignment-baseline: middle;
                    font-size: 12px;
                    font-weight: 300;
                    ${unselectable};
                  `}
                >
                  {label}
                </text>
              ))}
            </g>
          )}
        </svg>
      )}
    </Spring>
  );
}

LineChart.propTypes = {
  springConfig: PropTypes._spring,
  total: PropTypes.number,
  width: PropTypes.number,
  height: PropTypes.number,
  dotRadius: PropTypes.number,
  animDelay: PropTypes.number,
  borderColor: PropTypes.string,
  labelColor: PropTypes.string,
  lines: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        id: PropTypes.number,
        values: PropTypes.arrayOf(PropTypes.number).isRequired, // numbers between 0 and 1
        color: PropTypes.string, // overrides the color() prop if set
      }),
      // values can also be passed directly
      PropTypes.arrayOf(PropTypes.number),
    ])
  ),
  label: PropTypes.oneOfType([PropTypes.func, PropTypes._null]),
  renderCheckpoints: PropTypes.bool,
  reset: PropTypes.bool,
  color: PropTypes.func,
};

LineChart.defaultProps = {
  springConfig: springs.lazy,
  total: -1,
  height: 200,
  dotRadius: 7 / 2,
  animDelay: 500,
  rendercheckpoints: false,
  reset: false,
  borderColor: "rgba(209, 209, 209, 0.5)",
  labelColor: "white",
  lines: [],
  label: (index) => index + 1,
  color: (index, { lines }) =>
    `hsl(${(index * (360 / lines.length) + 40) % 360}, 60%, 70%)`,
};

export default LineChart;
