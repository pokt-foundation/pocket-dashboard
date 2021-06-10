import React from 'react'
import TextCopy from 'ui/TextCopy/TextCopy'

export default {
  title: 'pocketUI/TextCopy',
  component: TextCopy,
  argTypes: {
    value: { control: 'text', defaultValue: 'Log in' },
    monospace: { control: 'boolean', defaultValue: false },
  },
}

const Template = (args) => <TextCopy {...args} />

export const Primary = Template.bind({})
