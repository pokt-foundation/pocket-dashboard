import React, { useRef } from 'react'
import { animated, useSpring } from 'react-spring'
import 'styled-components/macro'
import { useTheme, GU } from '@pokt-foundation/ui'

const SVG_SIZE = 2 * GU

export default function SuccessIndicator({ mode }) {
  const pathRef = useRef()
  const theme = useTheme()

  const props = useSpring({
    x: 2,
    deg: mode === 'positive' ? 0 : 180,
    from: { x: 0, deg: 0 },
  })

  return (
    <div
      css={`
        position: relative;
        width: ${2 * GU}px;
        height: ${2 * GU}px;
      `}
    >
      <animated.svg
        width={SVG_SIZE}
        height={SVG_SIZE}
        viewBox="0 0 9 13"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        css={`
          position: absolute;
          top: 0;
          left: 0;
        `}
        style={{
          transform: props.deg.interpolate((v) => `rotate(${v}deg)`),
        }}
      >
        <animated.line
          x1="4.42282"
          y1="11.5274"
          x2="4.42282"
          y2="1.924"
          stroke={theme.accentAlternative}
          strokeWidth={props.x}
          strokeLinecap="round"
          ref={pathRef}
        />
        <path
          d="M6.77847 5.17722C7.15564 5.58066 7.78845 5.60195 8.19189 5.22478C8.59533 4.84761 8.61662 4.2148 8.23945 3.81137L6.77847 5.17722ZM4.58837 1.37031L5.31886 0.687381C5.12976 0.485115 4.86527 0.370307 4.58837 0.370307C4.31148 0.370307 4.04698 0.485115 3.85789 0.687381L4.58837 1.37031ZM0.937298 3.81137C0.560129 4.2148 0.581422 4.84761 0.984859 5.22478C1.3883 5.60195 2.0211 5.58066 2.39827 5.17722L0.937298 3.81137ZM8.23945 3.81137L5.31886 0.687381L3.85789 2.05323L6.77847 5.17722L8.23945 3.81137ZM3.85789 0.687381L0.937298 3.81137L2.39827 5.17722L5.31886 2.05323L3.85789 0.687381Z"
          fill={theme.accentAlternative}
        />
      </animated.svg>
    </div>
  )
}
