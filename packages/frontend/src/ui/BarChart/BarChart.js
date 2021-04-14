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
import { GU, springs } from "ui/style";
import { unselectable } from "ui";

const LABELS_HEIGHT = 30;
const WIDTH_DEFAULT = 300;
const GAP = 0.9;

const FULL_DAY = 24; // hours, equivalent to rectangles drawn

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

const OFFSET = 50;

function BarChart({
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
  scales,
  springConfig,
  threshold,
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

  const getRectX = useCallback(
    (index) => {
      return (width / FULL_DAY) * index + GU;
    },
    [width]
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

  const labels = label;

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
          viewBox={`0 0 ${width + OFFSET} ${height + GU}`}
          width={widthProps || "auto"}
          height="auto"
          css="display: block"
          {...props}
        >
          <g mask="url(#chart-mask)" transform={`translate(${-1 * GU},${GU})`}>
            {totalCount > 0 && (
              <path
                d={`
                  ${[...new Array(totalCount - 1)].reduce(
                    (path, _, index) =>
                      `${path} M ${getX(index)},${
                        !index ? 0 : chartHeight
                      } l 0,-8`,
                    ""
                  )}
                `}
                stroke={borderColor}
                strokeWidth="0"
              />
            )}
            {lines.map((line, lineIndex) => {
              return (
                <g key={`line-plot-${line.id || lineIndex}`}>
                  {line.values.map((val, index) => {
                    return (
                      <>
                        <rect
                          x={getRectX(index)}
                          y={chartHeight - chartHeight * val * progress}
                          width={(width / FULL_DAY) * GAP}
                          height={chartHeight * val * progress}
                          fill={line.color || color(lineIndex, { lines })}
                          css={`
                            opacity: ${val};
                          `}
                        />
                        <rect
                          x={getRectX(index)}
                          y={chartHeight - chartHeight * val - GU / 2}
                          width={(width / FULL_DAY) * GAP}
                          height={2}
                          fill={line.color || color(lineIndex, { lines })}
                          css={`
                            opacity: 0.5;
                          `}
                        />
                      </>
                    );
                  })}
                </g>
              );
            })}
          </g>
          {labels && (
            <g transform={`translate(0,${chartHeight})`}>
              {labels.map((label, index) => (
                <text
                  key={index}
                  x={(width / FULL_DAY) * index + (index ? GU : 0)}
                  y={LABELS_HEIGHT}
                  textAnchor={getLabelPosition(index, labels.length)}
                  fill={labelColor}
                  css={`
                    position: relative;
                    alignment-baseline: middle;
                    font-size: 10px;
                    font-weight: 300;
                    );
                    ${unselectable};
                    ${index % 2 !== 0 && `font-size: 6px;`}
                  `}
                >
                  {label}
                </text>
              ))}
            </g>
          )}
          <g transform={`translate(${2 * GU},${GU})`}>
            {scales &&
              scales.map(({ label, highlightColor }, index) => {
                const scaleLength = scales.length - 1;

                return (
                  <text
                    key={index}
                    x={width - OFFSET / 4}
                    y={
                      chartHeight - (chartHeight / scaleLength) * index + GU / 2
                    }
                    textAnchor={getLabelPosition(0, labels.length)}
                    fill={highlightColor ? highlightColor : labelColor}
                    css={`
                      alignment-baseline: middle;
                      font-size: 12px;
                      font-weight: 300;
                      ${unselectable};
                      ${highlightColor &&
                      `
                        font-weight: 800;
                        font-size
                      `}
                    `}
                  >
                    {label}
                  </text>
                );
              })}
          </g>
          {threshold && (
            <>
              <line
                x1={0}
                y1={chartHeight / (scales.length - 1) + GU}
                x2={width}
                y2={chartHeight / (scales.length - 1) + GU}
                style={{ stroke: "#952828", strokeWidth: 2 }}
              />{" "}
              <defs>
                <linearGradient id="thresholdFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stop-color="red" stopOpacity="0" />
                  <stop offset="100%" stop-color="#952828" stopOpacity="30%" />
                </linearGradient>
              </defs>
              <rect
                x={0}
                y={0}
                width={width}
                height={chartHeight / (scales.length - 1) + GU}
                fill="url(#thresholdFill)"
              />
            </>
          )}
        </svg>
      )}
    </Spring>
  );
}

BarChart.propTypes = {
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
  scales: PropTypes.arrayOf(PropTypes.string),
  renderCheckpoints: PropTypes.bool,
  reset: PropTypes.bool,
  threshold: PropTypes.bool,
  color: PropTypes.func,
};

BarChart.defaultProps = {
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
  scales: [],
  threshold: false,
  label: (index) => index + 1,
  color: (index, { lines }) =>
    `hsl(${(index * (360 / lines.length) + 40) % 360}, 60%, 70%)`,
};

export default BarChart;
