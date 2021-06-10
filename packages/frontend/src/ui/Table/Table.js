import React from 'react'
import PropTypes from 'prop-types'
import 'styled-components/macro'
import { useTheme } from 'ui/theme'

function Table({ header, children, noSideBorders, noTopBorders, ...props }) {
  const theme = useTheme()

  return (
    <table
      {...props}
      css={`
        width: 100%;
        border-spacing: 0;

        td {
          background: inherit;
          border-bottom: 1px solid ${noTopBorders ? '0' : theme.border};
        }

        /* First and last cell styling */
        tr:first-child td {
          border-top: 1px solid ${noTopBorders ? '0' : theme.border};
        }
        td:first-child {
          border-left: ${noSideBorders ? '0' : `1px solid ${theme.border}`};
        }
        td:last-child {
          border-right: ${noSideBorders ? '0' : `1px solid ${theme.border}`};
        }

        /* First and last row styling */
        tr:first-child td:first-child {
          border-top-left-radius: ${noSideBorders ? '0' : '3px'};
        }
        tr:first-child td:last-child {
          border-top-right-radius: ${noSideBorders ? '0' : '3px'};
        }
        tr:last-child td:first-child {
          border-bottom-left-radius: ${noSideBorders ? '0' : '3px'};
        }
        tr:last-child td:last-child {
          border-bottom-right-radius: ${noSideBorders ? '0' : '3px'};
        }
      `}
    >
      {header && <thead>{header}</thead>}
      <tbody>{children}</tbody>
    </table>
  )
}

Table.propTypes = {
  children: PropTypes.node,
  header: PropTypes.node,
  noSideBorders: PropTypes.bool,
  noTopBorders: PropTypes.bool,
}

Table.defaultProps = {
  noSideBorders: false,
  noTopBorders: false,
}

export default Table
