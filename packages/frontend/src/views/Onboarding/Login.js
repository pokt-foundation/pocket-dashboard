import React, { useCallback, useMemo, useState } from 'react'
import { Link as RouterLink, useHistory } from 'react-router-dom'
import { useMutation } from 'react-query'
import axios from 'axios'
import 'styled-components/macro'
import {
  Button,
  Field,
  Link,
  Spacer,
  TextInput,
  textStyle,
  useTheme,
  GU,
  RADIUS,
} from '@pokt-foundation/ui'
import Onboarding from 'components/Onboarding/Onboarding'
import env from 'environment'

export default function Login() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState(null)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState(null)
  const [errors, setErrors] = useState([])
  const theme = useTheme()
  const history = useHistory()

  const { isLoading, mutate } = useMutation(async function login(e) {
    try {
      const path = `${env('BACKEND_URL')}/api/users/login`
      const res = await axios.post(
        path,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      )

      if (res.status === 200 || res.status === 204) {
        history.push({
          pathname: '/home',
        })
      }
    } catch (err) {
      const { errors = [] } = err?.response?.data

      setErrors(() => [...errors])
    }
  })

  const onEmailChange = useCallback((e) => setEmail(e.target.value), [])
  const onPasswordChange = useCallback((e) => setPassword(e.target.value), [])
  const onInputFocus = useCallback(() => {
    if (errors.length) {
      setErrors([])
    }
    if (emailError) {
      setEmailError(null)
    }
    if (passwordError) {
      setPasswordError(null)
    }
  }, [emailError, errors, passwordError])
  const onEmailBlur = useCallback(() => {
    if (!email) {
      const emailError = {
        id: 'INVALID_EMAIL',
        message: 'Email cannot be empty',
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
    }
  }, [password])

  const isSubmitDisabled = useMemo(
    () => isLoading || errors.length > 0 || emailError || passwordError,
    [emailError, errors, passwordError, isLoading]
  )

  return (
    <Onboarding>
      <h2
        css={`
          ${textStyle('title1')};
          align-self: flex-start;
        `}
      >
        Welcome back
      </h2>
      <Spacer size={4 * GU} />
      <main
        css={`
          position: relative;
          z-index: 2;
          width: 100%;
          height: auto;
          border-radius: ${RADIUS * 2}px;
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
              onChange={onEmailChange}
              onFocus={onInputFocus}
              onBlur={onEmailBlur}
            />
            <Spacer size={GU / 2} />
            {emailError && (
              <p
                css={`
                  color: ${theme.negative};
                `}
              >
                {emailError.message}
              </p>
            )}
          </Field>
          <Field label="Password" required>
            <TextInput
              wide
              value={password}
              placeholder="********"
              onChange={onPasswordChange}
              onFocus={onInputFocus}
              onBlur={onPasswordBlur}
              type="password"
            />
            <Spacer size={GU / 2} />
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
          {passwordError && <Spacer size={3 * GU} />}
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
          <RouterLink
            to={{
              pathname: '/forgotpassword',
            }}
            component={Link}
            external={false}
            css={`
              && {
                width: auto;
                text-align: left;
              }
            `}
          >
            Forgot your password?
          </RouterLink>
          <Spacer size={3 * GU} />
          <Button
            type="submit"
            mode="strong"
            disabled={isSubmitDisabled}
            onClick={(e) => {
              e.preventDefault()
              mutate()
            }}
            css={`
              max-width: ${22.5 * GU}px;
              margin-bottom: ${2 * GU}px;
            `}
          >
            Log in
          </Button>
          <p>
            Don't have an account?{' '}
            <RouterLink
              to={{
                pathname: '/signup',
              }}
              component={Link}
              external={false}
            >
              Get started.
            </RouterLink>
          </p>
        </form>
      </main>
    </Onboarding>
  )
}
