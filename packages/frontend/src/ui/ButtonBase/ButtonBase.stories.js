import React from 'react'
import ButtonBase from 'ui/ButtonBase/ButtonBase'

export default {
  title: 'pocketUI/ButtonBase',
  component: ButtonBase,
  argTypes: {
    children: { control: 'text', defaultValue: 'Log in' },
    disabled: { control: 'boolean', defaultValue: false },
    display: {
      control: { type: 'select', options: ['auto', 'all', 'icon', 'label'] },
      defaultValue: 'auto',
    },
    external: {
      control: {
        type: 'boolean',
        defaultValue: false,
      },
    },
    href: { control: 'text', defaultValue: '' },
  },
}

const Template = (args) => <ButtonBase {...args} />

export const Primary = Template.bind({})
