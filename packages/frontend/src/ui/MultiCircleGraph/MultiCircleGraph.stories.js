import React from 'react'
import 'styled-components/macro'
import MultiCircleGraph from 'ui/MultiCircleGraph/MultiCircleGraph'

export default {
  title: 'pocketUI/MultiCircleGraph',
  component: MultiCircleGraph,
  argTypes: {
    values: { control: 'text', defaultValue: '0.2,0.4,0.8' },
  },
}

const Template = (args) => (
  <MultiCircleGraph
    {...args}
    values={args.values.split(',').map((v) => Number(v))}
  />
)

export const Primary = Template.bind({})
