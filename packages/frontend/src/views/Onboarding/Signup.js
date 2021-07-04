import React, { useCallback, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { useMutation } from 'react-query'
import axios from 'axios'
import { isEmail, isStrongPassword } from 'validator'
import styled from 'styled-components/macro'
import { useViewport } from 'use-viewport'
import * as Sentry from '@sentry/react'
import {
  Button,
  Field,
  CheckBox,
  Link,
  Spacer,
  TextInput,
  textStyle,
  useTheme,
  GU,
} from '@pokt-foundation/ui'
import Onboarding from 'components/Onboarding/Onboarding'
import VerifyResetNotice from 'components/VerifyResetNotice/VerifyResetNotice'
import env from 'environment'
import { sentryEnabled } from 'sentry'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [repeatedPassword, setRepeatedPassword] = useState('')
  const [repeatedPasswordError, setRepeatedPasswordError] = useState(null)
  const [errors, setErrors] = useState([])
  const [checked, setChecked] = useState(false)
  const { isError, isLoading, isSuccess, mutate, reset } = useMutation(
    async function signup() {
      try {
        const path = `${env('BACKEND_URL')}/api/users/signup`

        await axios.post(path, {
          email,
          password,
        })
      } catch (err) {
        const { errors = [] } = err?.response?.data

        setErrors(() => [...errors])

        if (sentryEnabled) {
          Sentry.captureException(err)
        }

        throw err
      }
    }
  )

  const onCheckChange = useCallback((e) => setChecked(e), [])
  const onEmailChange = useCallback((e) => setEmail(e.target.value), [])
  const onPasswordChange = useCallback((e) => setPassword(e.target.value), [])
  const onRepeatedPasswordChange = useCallback(
    (e) => setRepeatedPassword(e.target.value),
    []
  )
  const onInputFocus = useCallback(() => {
    if (errors.length) {
      setErrors([])
      reset()
    }
    if (emailError) {
      setEmailError(null)
    }
    if (passwordError) {
      setPasswordError(null)
    }
    if (repeatedPasswordError) {
      setRepeatedPasswordError(null)
    }
  }, [emailError, errors, passwordError, repeatedPasswordError, reset])
  const onEmailBlur = useCallback(() => {
    if (!email) {
      const emailError = {
        id: 'INVALID_EMAIL',
        message: 'Email cannot be empty',
      }

      setEmailError(emailError)
    }

    if (!isEmail(email)) {
      const emailError = {
        id: 'INVALID_EMAIL',
        message: 'Please enter a valid email.',
      }

      setEmailError(emailError)
    }
  }, [email])
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

      setPasswordError(passwordError)
    }
  }, [password])
  const onRepeatedPasswordBlur = useCallback(() => {
    if (!password) {
      const passwordError = {
        id: 'INVALID_PASSWORD',
        message: 'Password cannot be empty',
      }

      setPasswordError(passwordError)
    } else if (password !== repeatedPassword) {
      const passwordError = {
        id: 'NON_MATCHING_PASSWORD',
        message: "Passwords don't match",
      }

      setPasswordError(passwordError)
    }
  }, [password, repeatedPassword])

  const isSubmitDisabled = useMemo(
    () =>
      !email ||
      !password ||
      !repeatedPassword ||
      isLoading ||
      isError ||
      errors.length > 0 ||
      emailError ||
      passwordError ||
      !checked ||
      repeatedPasswordError,
    [
      checked,
      email,
      emailError,
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
        <VerifyResetNotice email={email} />
      ) : (
        <SignupForm
          checked={checked}
          email={email}
          emailError={emailError}
          errors={errors}
          password={password}
          passwordError={passwordError}
          repeatedPassword={repeatedPassword}
          repeatedPasswordError={repeatedPasswordError}
          isSubmitDisabled={isSubmitDisabled}
          onCheckChange={onCheckChange}
          onEmailBlur={onEmailBlur}
          onEmailChange={onEmailChange}
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

function SignupForm({
  checked,
  email,
  emailError,
  errors,
  password,
  passwordError,
  repeatedPassword,
  repeatedPasswordError,
  isSubmitDisabled,
  onCheckChange,
  onEmailBlur,
  onEmailChange,
  onInputFocus,
  onPasswordBlur,
  onPasswordChange,
  onRepeatedPasswordBlur,
  onRepeatedPasswordChange,
  mutate,
}) {
  const theme = useTheme()
  const { within } = useViewport()

  const compactMode = within(-1, 'medium')

  return (
    <>
      <h2
        css={`
          ${textStyle('title1')}
          align-self: flex-start;
        `}
      >
        Get started
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
        <form
          onSubmit={!isSubmitDisabled ? mutate : undefined}
          css={`
            display: flex;
            flex-direction: column;
          `}
        >
          <Field label="Email" required>
            <TextInput
              wide
              value={email}
              placeholder="example@pokt.network"
              onBlur={onEmailBlur}
              onChange={onEmailChange}
              onFocus={onInputFocus}
            />
            {emailError && (
              <ErrorMessage
                css={`
                  color: ${theme.negative};
                `}
              >
                {emailError.message}
              </ErrorMessage>
            )}
          </Field>
          <Field label="Password" required>
            <TextInput
              wide
              value={password}
              onBlur={onPasswordBlur}
              onChange={onPasswordChange}
              onFocus={onInputFocus}
              type="password"
            />
            {passwordError && (
              <ErrorMessage
                css={`
                  color: ${theme.negative};
                `}
              >
                {passwordError.message}
              </ErrorMessage>
            )}
          </Field>
          <Field label="Repeat Password" required>
            <TextInput
              wide
              value={repeatedPassword}
              onBlur={onRepeatedPasswordBlur}
              onChange={onRepeatedPasswordChange}
              onFocus={onInputFocus}
              type="password"
            />
            <Spacer size={1 * GU} />
            <p
              css={`
                ${textStyle('body4')}
                color: ${theme.surfaceContentSecondary};
              `}
            >
              A good password has at least 8 characters, 1 uppercase character,
              1 number and 1 symbol.
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
          <label
            css={`
              margin-bottom: ${3 * GU}px;
              ${textStyle('body2')}
              word-break: ${compactMode ? 'break-word' : 'break-all'};
            `}
          >
            <CheckBox
              checked={checked}
              onChange={onCheckChange}
              aria-label="I agree to the pocket Dashboard terms and conditions"
              css={`
                display: inline-block;
                ${textStyle('body3')};
              `}
            />
            <span
              css={`
                padding-top: 5px;
                vertical-align: bottom;
                margin-left: ${1 * GU}px;
                ${textStyle('body3')};
              `}
            >
              I Agree to the Pocket Dashboard's{' '}
              <InlineLink href="https://www.pokt.network/site-terms-of-use">
                T. &amp; C.
              </InlineLink>{' '}
              and{' '}
              <InlineLink href="https://www.pokt.network/privacy-policy">
                Privacy Policy
              </InlineLink>
            </span>
          </label>
          <Button
            type="submit"
            mode="strong"
            disabled={isSubmitDisabled}
            onClick={(e) => {
              e.preventDefault()
              mutate()
            }}
            css={`
              margin-bottom: ${2 * GU}px;
              max-width: ${22 * GU}px;
            `}
          >
            Sign up
          </Button>
          <p
            css={`
              ${textStyle('body3')}
            `}
          >
            Do you have an account?{' '}
            <RouterLink
              to={{
                pathname: '/login',
              }}
              component={Link}
              external={false}
            >
              Log in.
            </RouterLink>
          </p>
        </form>
      </main>
    </>
  )
}

function ErrorMessage({ children }) {
  const theme = useTheme()

  return (
    <p
      css={`
        ${textStyle('body3')};
        color: ${theme.negative};
      `}
    >
      {children}
    </p>
  )
}

const InlineLink = styled(Link)`
  display: inline;
  vertical-align: bottom;
`
