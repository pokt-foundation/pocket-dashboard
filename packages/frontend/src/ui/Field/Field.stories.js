import React from 'react'
import 'styled-components/macro'
import Field from 'ui/Field/Field'
import TextInput from 'ui/TextInput/TextInput'

export default {
  title: 'pocketUI/Field',
  component: Field,
  argTypes: {
    label: { control: 'text', defaultValue: 'POKT Address' },
    required: { control: 'boolean', defaultValue: 'false' },
  },
}

const Template = (args) => {
  const [value, setValue] = React.useState('')

  return (
    <Field {...args}>
      {({ id }) => (
        <TextInput
          placeholder="deadbeef"
          value={value}
          id={id}
          onChange={(e) => setValue(e.target.value)}
        />
      )}
    </Field>
  )
}

export const Primary = Template.bind({})
