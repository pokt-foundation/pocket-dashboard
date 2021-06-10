import React from 'react'
import PropTypes from 'prop-types'
import { GU } from 'ui/style'
import Button from 'ui/Button/Button'
import ButtonBase from 'ui/ButtonBase/ButtonBase'

function ButtonIcon({ label, children, mode, ...props }) {
  if (mode === 'button') {
    return <Button label={label} icon={children} display="icon" {...props} />
  }

  return (
    <ButtonBase
      title={label}
      css={`
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: ${4 * GU}px;
        height: ${4 * GU}px;
        &:active {
          background: rgba(220, 234, 239, 0.3);
        }
      `}
      {...props}
    >
      {children}
    </ButtonBase>
  )
}

ButtonIcon.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,

  // deprecated
  mode: PropTypes.oneOf(['button']),
}

export default ButtonIcon
