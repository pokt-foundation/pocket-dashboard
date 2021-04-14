import React from "react";
import { keyframes } from "styled-components/macro";

const STROKE_WIDTH = 2;
const LOOP_DURATION = 1800;
const DONE_TRANSITION_DURATION = 400;
// circumference, found by manually incrementing it :o
// That comment above was written by @bpierre,
// and I can say I found this number in the same way :D
const DASH_ARRAY = 1100;
const GRADIENT_COLOR_START = "#31A1D2";
const GRADIENT_COLOR_STOP = "#31A1D2";
const ANIM_FUNCTION = "cubic-bezier(0.7, 0, 0.3, 1)";
const GRADIENT_ID = "loading-screen-logo-gradient";

const animGradient = keyframes`
  0% { stroke-dashoffset: ${DASH_ARRAY} }
  60%, 100% { stroke-dashoffset: 0 }
`;

const animMask = keyframes`
  0%, 10% { stroke-dashoffset: ${DASH_ARRAY} }
  90%, 100% { stroke-dashoffset: 0 }
`;

export default function AnimatedLogo({ done = false }) {
  return (
    <svg width={100} height={100} viewBox="0 0 100 100" overflow="visible">
      <Outline />
      <Outline
        gradient
        css={`
          stroke-dasharray: ${DASH_ARRAY};
          stroke-dashoffset: ${DASH_ARRAY};
          animation: ${LOOP_DURATION}ms ${ANIM_FUNCTION} infinite
            ${animGradient};
        `}
        style={{
          animationPlayState: done ? "paused" : "running",
        }}
      />
      <Outline
        css={`
          stroke-dasharray: ${DASH_ARRAY};
          stroke-dashoffset: ${DASH_ARRAY};
          animation: ${LOOP_DURATION}ms ${ANIM_FUNCTION} infinite ${animMask};
        `}
        style={{
          animationPlayState: done ? "paused" : "running",
        }}
      />{" "}
      <Outline
        gradient
        css={`
          transition: opacity ${DONE_TRANSITION_DURATION}ms ease-out;
        `}
        style={{ opacity: Number(done) }}
      />
      <defs>
        <linearGradient
          id={GRADIENT_ID}
          x1={0}
          y1={75.052}
          x2={143.077}
          y2={75.052}
          gradientUnits="userSpaceOnUse"
        >
          <stop offset={0} stopColor={GRADIENT_COLOR_START} />
          <stop offset={1} stopColor={GRADIENT_COLOR_STOP} />
        </linearGradient>
      </defs>
    </svg>
  );
}

function Outline({ gradient = false, ...props }) {
  return (
    <path
      d="M64.5406 2.16272V20.8204C64.5406 26.8654 59.6356 31.7665 53.5906 31.7627H53.4316C50.3977 31.7438 47.6706 31.7627 47.6706 31.7627C47.1517 31.7627 46.5836 31.7059 46.0836 31.7552C42.671 32.1074 39.7167 33.6565 37.2245 36.4025C37.1563 36.4783 37.0881 36.5578 37.0199 36.6374C35.0201 39.2357 33.9103 42.5877 33.9103 46.2086V46.3866C33.9103 48.716 34.3838 50.928 35.2511 52.9089C36.1185 54.8936 35.6753 57.1964 34.0164 58.5865C32.3877 59.95 30.4522 61.5559 29.1493 62.5975C25.3731 58.31 23.1573 52.6968 23.1573 46.5609V46.3829C23.1573 33.0543 33.8232 21.9415 48.3107 21.9415C49.216 21.9415 52.1665 21.9415 53.5452 21.9415V0.140141C52.371 0.0568139 51.1931 0 50 0C22.3847 0 0 22.3847 0 50C0 72.5551 14.9383 91.6143 35.4556 97.8449V79.3311C35.4556 73.2217 40.4098 68.2676 46.5192 68.2713H46.5684C49.6023 68.2941 52.3294 68.2713 52.3294 68.2713C52.8483 68.2713 53.4164 68.3282 53.9164 68.2751C57.329 67.9229 60.2833 66.3776 62.7756 63.6278C62.8475 63.552 62.9119 63.4725 62.9801 63.3929C64.9799 60.7946 66.0859 57.4426 66.0859 53.8217V53.6437C66.0859 51.8294 65.3246 49.4091 64.5595 47.4434C63.7111 45.2655 64.3626 42.7619 66.1579 41.262C67.707 39.9667 69.2713 38.694 70.8507 37.4328C74.6269 41.7203 76.8427 47.3335 76.8427 53.4694V53.6475C76.8427 66.9798 66.1768 78.0888 51.6893 78.0888C50.784 78.0888 47.8335 78.0888 46.4548 78.0888V99.8599C47.629 99.9432 48.8069 100 50 100C77.6153 100 100 77.6153 100 50C100 27.4525 85.0617 8.3933 64.5406 2.16272Z"
      fill="none"
      stroke={gradient ? `url(#${GRADIENT_ID})` : `#2c3a58`}
      strokeWidth={STROKE_WIDTH}
      {...props}
    />
  );
}
