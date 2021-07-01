import React, { useCallback, useEffect } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useMutation } from 'react-query'
import axios from 'axios'
import * as Sentry from '@sentry/react'
import 'styled-components/macro'
import { Button, Spacer, textStyle, GU } from '@pokt-foundation/ui'
import Onboarding from 'components/Onboarding/Onboarding'
import env from 'environment'
import { sentryEnabled } from 'sentry'
import { KNOWN_MUTATION_SUFFIXES } from 'known-query-suffixes'

export default function Validate() {
  const { search } = useLocation()
  const history = useHistory()

  const token = new URLSearchParams(search).get('token')
  const rawEmail = new URLSearchParams(search).get('email')
  const email = decodeURIComponent(rawEmail)

  const { isLoading, isSuccess, isError, mutate } = useMutation(
    async function validate() {
      try {
        const path = `${env('BACKEND_URL')}/api/users/validate-user`

        await axios.post(path, {
          plainToken: token,
          email,
        })
      } catch (err) {
        if (sentryEnabled) {
          Sentry.configureScope((scope) =>
            scope.setTransactionName(
              KNOWN_MUTATION_SUFFIXES.VALIDATE_USER_MUTATION
            )
          )
          Sentry.captureException(err)
        }

        throw err
      }
    }
  )

  const goToLogin = useCallback(() => history.push('/login'), [history])

  useEffect(() => {
    mutate()
  }, [mutate])

  return (
    <Onboarding>
      <h2
        css={`
          ${textStyle('title1')}
          align-self: flex-start;
        `}
      >
        {isSuccess ? 'Verify your Account' : 'Verified Account'}
      </h2>
      <Spacer size={4 * GU} />
      <main
        css={`
          position: relative;
          z-index: 2;
          width: 100%;
          height: auto;
        `}
      >
        {isLoading && (
          <p
            css={`
              ${textStyle('body2')}
            `}
          >
            Verifying...
          </p>
        )}
        {isSuccess && (
          <>
            <p
              css={`
                ${textStyle('body2')}
              `}
            >
              Now you can access the Portal to create endpoints for different
              networks, and monitor your app infrastructure, all in one place.
            </p>
            <Spacer size={2 * GU} />
            <p
              css={`
                ${textStyle('body2')}
              `}
            >
              Welcome to Web3 done the right way!
            </p>
            <Spacer size={3 * GU} />
            <Button
              mode="strong"
              onClick={goToLogin}
              css={`
                && {
                  width: ${22 * GU}px;
                }
              `}
            >
              Log In
            </Button>
          </>
        )}
        {isError && (
          <p
            css={`
              ${textStyle('body2')}
            `}
          >
            There was a problem while verifying your email.
          </p>
        )}
      </main>
    </Onboarding>
  )
}
