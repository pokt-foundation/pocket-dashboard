import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useMutation } from 'react-query'
import axios from 'axios'
import { isStrongPassword } from 'validator'
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
import { sentryEnabled } from 'sentry'

export default function NewPassword() {
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [repeatedPassword, setRepeatedPassword] = useState('')
  const [repeatedPasswordError, setRepeatedPasswordError] = useState(null)
  const [errors, setErrors] = useState([])
  const { search } = useLocation()

  const token = new URLSearchParams(search).get('token')
  const rawEmail = new URLSearchParams(search).get('email')
  const email = decodeURIComponent(rawEmail)

  const { isLoading, isError, isSuccess, mutate } = useMutation(
    async function sendResetEmail() {
      const path = `${env('BACKEND_URL')}/api/users/reset-password`

      try {
        await axios.post(path, {
          plainToken: token,
          password1: password,
          password2: repeatedPassword,
          email,
        })
      } catch (err) {
        if (sentryEnabled) {
          Sentry.captureException(err)
        }

        throw err
      }
    }
  )

  const onPasswordChange = useCallback((e) => setPassword(e.target.value), [])
  const onRepeatedPasswordChange = useCallback(
    (e) => setRepeatedPassword(e.target.value),
    []
  )
  const onInputFocus = useCallback(() => {
    if (errors.length) {
      setErrors([])
    }
    if (passwordError) {
      setPasswordError(null)
    }
    if (repeatedPasswordError) {
      setRepeatedPasswordError(null)
    }
  }, [errors, passwordError, repeatedPasswordError])
  const onPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: 'INVALID_PASSWORD',
        message: 'Password cannot be empty',
      }

      setPasswordError(passwordError)
    } else if (!isStrongPassword(password)) {
      const passwordError = {
        id: 'INVALID_PASSWORD',
        message: "Password's not strong enough.",
      }

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id)

      setErrors([...filteredErrors, passwordError])
    }
  }, [errors, password])
  const onRepeatedPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: 'INVALID_PASSWORD',
        message: 'Password cannot be empty',
      }

      setRepeatedPasswordError(passwordError)
    } else if (!isStrongPassword(repeatedPassword)) {
      const passwordError = {
        id: 'INVALID_PASSWORD',
        message: "Password's not strong enough.",
      }

      const filteredErrors = errors.filter(({ id }) => passwordError.id !== id)

      setErrors([...filteredErrors, passwordError])
    } else if (password !== repeatedPassword) {
      const passwordError = {
        id: 'NON_MATCHING_PASSWORD',
        message: "Passwords don't match",
      }

      setRepeatedPasswordError(passwordError)
    }
  }, [errors, password, repeatedPassword])

  const isSubmitDisabled = useMemo(
    () =>
      !password ||
      !repeatedPassword ||
      isLoading ||
      isError ||
      errors.length > 0 ||
      passwordError ||
      password !== repeatedPassword ||
      repeatedPasswordError,
    [
      errors,
      isError,
      isLoading,
      password,
      passwordError,
      repeatedPassword,
      repeatedPasswordError,
    ]
  )

  return (
    <Onboarding>
      {isSuccess ? (
        <ResetSuccessful />
      ) : (
        <ResetPasswordForm
          errors={errors}
          password={password}
          passwordError={passwordError}
          repeatedPassword={repeatedPassword}
          repeatedPasswordError={repeatedPasswordError}
          isSubmitDisabled={isSubmitDisabled}
          onInputFocus={onInputFocus}
          onPasswordBlur={onPasswordBlur}
          onPasswordChange={onPasswordChange}
          onRepeatedPasswordBlur={onRepeatedPasswordBlur}
          onRepeatedPasswordChange={onRepeatedPasswordChange}
          mutate={mutate}
        />
      )}
    </Onboarding>
  )
}

function ResetPasswordForm({
  errors,
  password,
  passwordError,
  repeatedPassword,
  repeatedPasswordError,
  isSubmitDisabled,
  onInputFocus,
  onPasswordBlur,
  onPasswordChange,
  onRepeatedPasswordBlur,
  onRepeatedPasswordChange,
  mutate,
}) {
  const theme = useTheme()

  return (
    <>
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
          label="New Password"
          required
          css={`
            margin-bottom: ${6 * GU}px;
          `}
        >
          <TextInput
            wide
            value={password}
            onChange={onPasswordChange}
            onBlur={onPasswordBlur}
            onFocus={onInputFocus}
            type="password"
          />
          {passwordError && (
            <p
              css={`
                color: ${theme.negative};
              `}
            >
              {passwordError.message}
            </p>
          )}
        </Field>
        <Field label="Password Confirmation" required>
          <TextInput
            wide
            value={repeatedPassword}
            onChange={onRepeatedPasswordChange}
            onBlur={onRepeatedPasswordBlur}
            onFocus={onInputFocus}
            type="password"
          />
          {repeatedPasswordError && (
            <p
              css={`
                color: ${theme.negative};
              `}
            >
              {repeatedPasswordError.message}
            </p>
          )}
          <Spacer size={1 * GU} />
          <p
            css={`
              ${textStyle('body4')}
              color: ${theme.surfaceContentSecondary};
            `}
          >
            A good password has at least 8 characters, 1 uppercase character, 1
            number and 1 symbol.
          </p>
        </Field>
        <ul
          css={`
            list-style-type: none;
          `}
        >
          {errors.map(({ id, message }) => (
            <li
              key={`${id}_${message}`}
              css={`
                color: ${theme.negative};
              `}
            >
              {message}
            </li>
          ))}
        </ul>
        <Spacer size={2 * GU} />
        <Button
          css={`
            margin-bottom: ${2 * GU}px;
          `}
          mode="strong"
          disabled={isSubmitDisabled}
          onClick={mutate}
        >
          Set new password
        </Button>
      </main>
    </>
  )
}

function ResetSuccessful() {
  const history = useHistory()

  const goToLogin = useCallback(() => history.push('/login'), [history])

  return (
    <>
      <h2
        css={`
          ${textStyle('title2')}
          align-self: flex-start;
        `}
      >
        Reset Password
      </h2>
      <Spacer size={4 * GU} />
      <p
        css={`
          ${textStyle('body2')}
        `}
      >
        You have reset your password successfully! You can now log in.
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
  )
}
