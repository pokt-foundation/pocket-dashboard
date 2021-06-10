import React from 'react'
import 'styled-components/macro'
import PropTypes from 'ui/prop-types'
import { GU } from 'ui'
import { useTheme } from 'ui'

function ContentContainerDefault({ align, ...props }) {
  return (
    <div
      css={`
        display: flex;
        align-items: center;
        justify-content: ${align === 'right' ? 'flex-end' : 'space-between'};
      `}
      {...props}
    />
  )
}

ContentContainerDefault.propTypes = {
  align: PropTypes.string,
}

function TableCell({ children, contentContainer: Container, align, ...props }) {
  const theme = useTheme()

  return (
    <td
      {...props}
      css={`
        padding: ${2.5 * GU}px;
        background: ${theme.surface};
        text-align: ${align};
      `}
    >
      <Container align={align}>{children}</Container>
    </td>
  )
}

TableCell.propTypes = {
  align: PropTypes.string,
  contentContainer: PropTypes._component,
  children: PropTypes.node,
}

TableCell.defaultProps = {
  align: 'left',
  contentContainer: ContentContainerDefault,
}

// Compatibility (not sure this is used at all?)
export { ContentContainerDefault as StyledTableCellContent }

export default TableCell
