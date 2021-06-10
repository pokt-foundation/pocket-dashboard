import React from 'react'
import Button from 'ui/Button/Button'

export default {
  title: 'pocketUI/Button',
  component: Button,
  argTypes: {
    children: { control: 'text', defaultValue: 'Log in' },
    disabled: { control: 'boolean', defaultValue: false },
    display: {
      control: { type: 'select', options: ['auto', 'all', 'icon', 'label'] },
      defaultValue: 'auto',
    },
    mode: {
      control: {
        type: 'select',
        options: ['normal', 'strong', 'positive', 'negative'],
      },
    },
    size: {
      control: {
        type: 'select',
        options: ['medium', 'small', 'mini'],
      },
      defaultValue: 'medium',
    },
    wide: { control: 'boolean', defaultValue: false },
  },
}

const Template = (args) => <Button {...args} />

export const Primary = Template.bind({})
