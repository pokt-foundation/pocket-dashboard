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
import OnboardingHeader from 'components/OnboardingHeader/OnboardingHeader'
import env from 'environment'
import PoktShape from 'assets/poktshape.png'

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
    <div
      css={`
        position: relative;
        width: 100%;
        min-height: 100vh;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background: #091828;
      `}
    >
      <img
        src={PoktShape}
        css={`
          position: absolute;
          bottom: 0%;
          right: -5%;
          width: 50%;
          max-width: ${80 * GU}px;
          height: auto;
          z-index: 1;
        `}
        alt="Ball"
      />
      <OnboardingHeader />
      <div
        css={`
          width: 100%;
          max-width: ${87 * GU}px;
          height: 100%;
        `}
      >
        <div
          css={`
            display: flex;
          `}
        >
          <Spacer size={8 * GU} />
          <h2
            css={`
              ${textStyle('title2')}
              margin-bottom: ${6 * GU}px;
              align-self: flex-start;
            `}
          >
            Welcome back
          </h2>
        </div>
        <main
          css={`
            position: relative;
            z-index: 2;
            width: 100%;
            height: auto;
            border-radius: ${RADIUS * 2}px;
            padding: ${5 * GU}px ${8 * GU}px;
            background: ${theme.surface};
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
                  margin-bottom: ${6 * GU}px;
                }
              `}
            >
              Forgot your password?
            </RouterLink>
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
              `}
            >
              Log in
            </Button>
            <p
              css={`
                text-align: center;
              `}
            >
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
      </div>
    </div>
  )
}
