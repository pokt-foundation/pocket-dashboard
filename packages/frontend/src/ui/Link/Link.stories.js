import React from 'react'
import Link from 'ui/Link/Link'

export default {
  title: 'pocketUI/Link',
  component: Link,
  argTypes: {
    children: {
      type: 'text',
      defaultValue: 'Click here!',
    },
    external: {
      control: 'boolean',
      defaultValue: false,
    },
    href: {
      control: {
        type: 'text',
        defaultValue: '',
      },
    },
  },
}

const Template = (args) => <Link {...args} />

export const Primary = Template.bind({})
