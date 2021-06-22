import React, { useEffect, useState } from 'react'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import { useMutation } from 'react-query'
import axios from 'axios'
import * as Sentry from '@sentry/react'
import 'styled-components/macro'
import { Link, Spacer, textStyle, useTheme, GU, RADIUS } from 'ui'
import OnboardingHeader from 'components/OnboardingHeader/OnboardingHeader'
import env from 'environment'
import PoktShape from 'assets/poktshape.png'
import { sentryEnabled } from 'sentry'
import { KNOWN_MUTATION_SUFFIXES } from 'known-query-suffixes'

export default function Validate() {
  const [errors, setErrors] = useState([])
  const theme = useTheme()
  const { search } = useLocation()

  const token = new URLSearchParams(search).get('token')
  const rawEmail = new URLSearchParams(search).get('email')
  const email = decodeURIComponent(rawEmail)

  const { isLoading, isSuccess, mutate } = useMutation(
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

        const { errors = [] } = err?.response?.data

        setErrors(() => [...errors])
      }
    }
  )

  useEffect(() => {
    // TODO: Actually implement exponential back-off retries
    mutate()
  }, [mutate])

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
      <OnboardingHeader />
      <img
        src={PoktShape}
        css={`
          position: absolute;
          bottom: 0%;
          right: -5%;
          width: 50%;
          max-width: ${120 * GU}px;
          height: auto;
          z-index: 1;
        `}
        alt="Ball"
      />
      <div
        css={`
          width: 100%;
          max-width: ${87 * GU}px;
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
            Verify your email
          </h2>
        </div>
        <main
          css={`
            position: relative;
            z-index: 2;
            width: 100%;
            height: auto;
            max-width: ${120 * GU}px;
            border-radius: ${RADIUS * 2}px;
            padding: ${5 * GU}px ${8 * GU}px;
            background: ${theme.surface};
            display: flex;
            flex-direction: column;
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
            <p
              css={`
                ${textStyle('body2')}
              `}
            >
              Your email has been verified! You can now&nbsp;
              <RouterLink
                to={{
                  pathname: '/login',
                }}
                component={Link}
                external={false}
              >
                log in
              </RouterLink>
              .
            </p>
          )}
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
        </main>
      </div>
    </div>
  )
}
