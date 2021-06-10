import React from 'react'
import 'styled-components/macro'
import Button from 'ui/Button/Button'
import Popover from 'ui/Popover/Popover'

export default {
  title: 'pocketUI/Popover',
  component: Popover,
  argTypes: {
    visible: { control: 'boolean', defaultValue: false },
  },
}

const Template = (args) => {
  const opener = React.createRef()

  return (
    <div>
      <Button onClick={() => {}} ref={opener}>
        Show
      </Button>
      <Popover
        visible={args.visible || false}
        opener={opener.current}
        {...args}
      >
        Hey
      </Popover>
    </div>
  )
}

export const Primary = Template.bind({})
