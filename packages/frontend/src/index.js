import React from 'react'
import ReactDOM from 'react-dom'
import App from 'App'
import env from 'environment'
import initializeSentry from 'sentry'

import '@fontsource/manrope'

const REACT_AXE_THROTTLE_TIME = 2500

initializeSentry()

if (!env('PROD') && env('ENABLE_A11Y')) {
  const axe = require('@axe-core/react')

  axe(React, ReactDOM, REACT_AXE_THROTTLE_TIME)
}

ReactDOM.render(<App />, document.getElementById('root'))
