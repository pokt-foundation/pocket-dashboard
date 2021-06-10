import React from 'react'
import CheckBox from 'ui/CheckBox/CheckBox'

export default {
  title: 'pocketUI/CheckBox',
  component: CheckBox,
  argTypes: {
    disabled: { control: 'boolean', defaultValue: false },
    checked: { control: 'boolean', defaultValue: false },
    indeterminate: { control: 'boolean', defaultValue: false },
  },
}

const Template = (args) => <CheckBox {...args} />

export const Primary = Template.bind({})
