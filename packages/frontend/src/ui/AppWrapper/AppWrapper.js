import React from 'react'
import PropTypes from 'prop-types'
import { ViewportProvider } from 'use-viewport'
import BaseStyles from 'ui/BaseStyles/BaseStyles'
import ToastHubProvider from 'ui/ToastHub/ToastHub'
import { Root } from 'ui/Root/Root'
import { Theme } from 'ui/theme'

import '@fontsource/manrope'
import '@fontsource/source-code-pro'

export default function AppWrapper({ children }) {
  return (
    <Root.Provider>
      <BaseStyles />
      <Theme theme="dark">
        <ViewportProvider>
          <ToastHubProvider>{children}</ToastHubProvider>
        </ViewportProvider>
      </Theme>
    </Root.Provider>
  )
}

AppWrapper.propTypes = {
  children: PropTypes.node,
}
