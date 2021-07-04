import React, { useCallback, useState } from 'react'
import { useMutation } from 'react-query'
import axios from 'axios'
import * as Sentry from '@sentry/react'
import 'styled-components/macro'
import {
  Button,
  Field,
  Spacer,
  TextInput,
  textStyle,
  useTheme,
  GU,
} from '@pokt-foundation/ui'
import Onboarding from 'components/Onboarding/Onboarding'
import env from 'environment'
import { KNOWN_MUTATION_SUFFIXES } from 'known-query-suffixes'
import { sentryEnabled } from 'sentry'
import VerifyNotice from 'components/VerifyResetNotice/VerifyResetNotice'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const theme = useTheme()

  const { isLoading, isError, isSuccess, mutate } = useMutation(
    async function sendResetEmail(e) {
      const path = `${env('BACKEND_URL')}/api/users/send-reset-email`

      try {
        await axios.post(path, {
          email,
        })
      } catch (err) {
        if (sentryEnabled) {
          Sentry.configureScope((scope) => {
            scope.setTransactionName(
              KNOWN_MUTATION_SUFFIXES.SEND_RESET_EMAIL_MUTATION
            )
          })
          Sentry.captureException(err)
        }
        throw new Error(err)
      }
    }
  )

  const onEmailChange = useCallback((e) => setEmail(e.target.value), [])

  return isSuccess ? (
    <Onboarding>
      <VerifyNotice email={email} mode="reset" />
    </Onboarding>
  ) : (
    <Onboarding>
      <h2
        css={`
          ${textStyle('title1')}
          align-self: flex-start;
        `}
      >
        Reset Password
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
        <Field
          label="Registered Email"
          required
          css={`
            margin-bottom: ${6 * GU}px;
          `}
        >
          <TextInput
            wide
            value={email}
            onChange={onEmailChange}
            type="email"
            disabled={isLoading}
          />
          {isError && (
            <p
              css={`
                ${textStyle('body2')};
                color: ${theme.negative};
              `}
            >
              There doesn't seem to be an account registered with that email.
              Please try again.
            </p>
          )}
        </Field>
        <Spacer size={3 * GU} />
        <Button
          css={`
            margin-bottom: ${2 * GU}px;
            width: ${22 * GU}px;
          `}
          mode="strong"
          disabled={isLoading}
          onClick={(e) => mutate(e)}
        >
          Reset Password
        </Button>
      </main>
    </Onboarding>
  )
}
