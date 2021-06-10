import React from 'react'
import LineChart from './LineChart'

export default {
  title: 'pocketUI/LineChart',
  component: LineChart,
}

const LINES = [{ id: 1, values: [0.1, 0.2, 0.3, 0] }]

const LABELS = ['', '', '', '']

const Template = (args) => {
  return (
    <LineChart
      lines={LINES}
      springConfig={{ mass: 1, tension: 120, friction: 80 }}
      label={(index) => LABELS[index]}
      height={90}
      color={() => `#1B2331`}
    />
  )
}

export const Primary = Template.bind({})
