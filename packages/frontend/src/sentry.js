import { init as initSentry, captureMessage } from '@sentry/browser'
import { Integrations } from '@sentry/tracing'
import env from 'environment'

export const sentryEnabled = Boolean(env('SENTRY_DSN'))

export default function initializeSentry() {
  if (sentryEnabled) {
    console.log('SENTRY ENABLED')

    initSentry({
      dsn: env('SENTRY_DSN'),
      environment: env('PROD') ? 'production' : 'development',
      integrations: [new Integrations.BrowserTracing()],
      release: 'pocket-dashboard@' + env('BUILD'),
      tracesSampleRate: 1.0,
    })
  }
}

export function logWithSentry(message, level = 'warning') {
  if (sentryEnabled) {
    captureMessage(message, level)
  }
}
