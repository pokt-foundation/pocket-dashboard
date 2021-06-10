import React from 'react'
import Help from 'ui/Help/Help'

export default {
  title: 'pocketUI/Help',
  component: Help,
  argTypes: {
    children: {
      control: 'text',
      defaultValue:
        'I am a help hint. Here you will get useful information about something, if implemented correctly!',
    },
    hint: {
      control: 'text',
      defaultValue: 'What is this for?',
    },
  },
}

const Template = (args) => {
  return <Help {...args} />
}

export const Primary = Template.bind({})
