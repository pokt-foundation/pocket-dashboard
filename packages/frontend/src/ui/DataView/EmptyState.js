import React, { useMemo } from 'react'
import 'styled-components/macro'
import PropTypes from 'prop-types'
import { useTheme, GU, textStyle } from 'ui'
import LoadingRing from '../LoadingRing/LoadingRing'
import Link from '../Link/Link'

function useEmptyStateParts(status, configurator, functionMode) {
  const defaultConfigurator = useMemo(() => {
    return {
      default: {
        displayLoader: false,
        title: 'No data available.',
        subtitle: null,
        clearLabel: null,
      },
      loading: {
        displayLoader: true,
        title: 'Loading data',
        subtitle: null,
        clearLabel: null,
      },
      'empty-filters': {
        displayLoader: false,
        title: 'No results found.',
        subtitle: 'We cannot find any item matching your filter selection.',
        clearLabel: 'Clear filters',
      },
      'empty-search': {
        displayLoader: false,
        title: 'No results found.',
        subtitle: 'We cannot find any item matching your search query.',
        clearLabel: 'Clear filters',
      },
    }
  }, [])

  const parts = functionMode ? {} : configurator[status]

  return {
    ...defaultConfigurator[status],
    ...parts,
  }
}

function EmptyState({ status, configurator, onStatusEmptyClear }) {
  const theme = useTheme()

  const functionMode = typeof configurator === 'function'
  const emptyState = useEmptyStateParts(status, configurator, functionMode)
  const emptyStateOverride = functionMode ? configurator(status) : null

  // Returning an element from the function mode overrides everything.
  // If `null` or a non-element is returned, the default state is used instead.
  if (React.isValidElement(emptyStateOverride)) {
    return emptyStateOverride
  }

  return (
    <section
      css={`
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <div
        css={`
          width: ${31 * GU}px;
          padding: ${8 * GU}px 0;
          text-align: center;
        `}
      >
        {emptyState.illustration && (
          <div
            css={`
              padding-bottom: ${2 * GU}px;
            `}
          >
            {emptyState.illustration}
          </div>
        )}

        {emptyState.title && (
          <h1
            css={`
              ${textStyle('title2')};
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            {emptyState.displayLoader && (
              <LoadingRing
                css={`
                  margin-right: ${1 * GU}px;
                `}
              />
            )}
            {emptyState.title}
          </h1>
        )}

        {emptyState.subtitle && (
          <div
            css={`
              color: ${theme.surfaceContentSecondary};
            `}
          >
            {emptyState.subtitle}{' '}
            {emptyState.clearLabel && (
              <Link onClick={onStatusEmptyClear}>{emptyState.clearLabel}</Link>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

EmptyState.propTypes = {
  status: PropTypes.oneOf([
    'default',
    'empty-filters',
    'empty-search',
    'loading',
  ]),
  configurator: PropTypes.object,
  onStatusEmptyClear: PropTypes.func,
}

export default EmptyState
