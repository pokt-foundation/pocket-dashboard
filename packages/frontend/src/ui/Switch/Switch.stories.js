import React from 'react'
import Switch from 'ui/Switch/Switch'

export default {
  title: 'pocketUI/Switch',
  component: Switch,
  argTypes: {
    checked: { control: 'boolean', defaultValue: false },
    disabled: {
      control: {
        type: 'boolean',
        defaultValue: false,
      },
    },
  },
}

const Template = (args) => <Switch {...args} />

export const Primary = Template.bind({})
