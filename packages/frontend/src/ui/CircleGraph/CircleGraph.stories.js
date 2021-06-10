import React from 'react'
import 'styled-components/macro'
import CircleGraph from 'ui/CircleGraph/CircleGraph'

export default {
  title: 'pocketUI/CircleGraph',
  component: CircleGraph,
  argTypes: {
    value: { control: 'number', defaultValue: 0.5 },
  },
}

const Template = (args) => <CircleGraph {...args} />

export const Primary = Template.bind({})
