import React, { useCallback, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useMutation } from 'react-query'
import { sentryEnabled } from 'sentry'
import { useViewport } from 'use-viewport'
import * as Sentry from '@sentry/react'
import 'styled-components/macro'
import {
  ButtonBase,
  DiscButton,
  IconCog,
  IconPerson,
  Link,
  Popover,
  textStyle,
  useTheme,
  GU,
  RADIUS,
} from '@pokt-foundation/ui'
import env from 'environment'
import axios from 'axios'

const DEFAULT_TITLE = 'Pocket Dashboard'

function useRouteTitle(applications = []) {
  const { pathname } = useLocation()

  if (pathname.includes('notifications')) {
    return 'Notifications'
  }

  if (pathname.includes('success-details')) {
    return 'Request Status Details'
  }

  if (pathname.includes('security')) {
    return 'App Security'
  }

  if (pathname.includes('app')) {
    const title = applications.reduce(
      (title, { appId, appName }) =>
        pathname.includes(appId) ? appName : title,
      DEFAULT_TITLE
    )

    return title
  }

  if (pathname.includes('home')) {
    return 'Network Overview'
  }

  if (pathname.includes('create')) {
    return 'Application Setup'
  }

  return DEFAULT_TITLE
}

export default function NavigationBar({ applications = [] }) {
  const history = useHistory()
  const title = useRouteTitle(applications)
  const theme = useTheme()
  const { mutate: onLogout } = useMutation(async function logout() {
    const path = `${env('BACKEND_URL')}/api/users/logout`

    try {
      await axios.post(
        path,
        {},
        {
          withCredentials: true,
        }
      )

      history.push('/login')
    } catch (err) {
      if (sentryEnabled) {
        Sentry.captureException(err)
      }
      throw err
    }
  })

  return (
    <nav
      css={`
        display: flex;
        flex-direction: row;
        margin-top: ${3 * GU}px;
        align-items: center;
      `}
    >
      <h1
        css={`
          display: inline-block;
          flex-grow: 1;
          ${textStyle('title1')}
        `}
      >
        <span>{title}</span>
      </h1>
      <ul
        css={`
          list-style: none;
          display: flex;
          justify-content: center;
          align-items: center;
          li {
            display: inline-block;
          }
          li:not(:last-child) {
            margin-right: ${7 * GU}px;
          }
        `}
      >
        <li>
          <Link
            href="https://discord.com/invite/uYs6Esum3r"
            css={`
              && {
                color: ${theme.content};
                text-decoration: none;
                &:hover {
                  color: ${theme.accent};
                }
              }
            `}
          >
            Community
          </Link>
        </li>
        <li>
          <SettingsButton onLogout={onLogout} />
        </li>
      </ul>
    </nav>
  )
}

function SettingsButton({ onLogout }) {
  const theme = useTheme()
  const { below } = useViewport()

  const [opened, setOpened] = useState(false)
  const containerRef = useRef()

  const handleToggle = useCallback(() => setOpened((opened) => !opened), [])
  const handleClose = useCallback(() => setOpened(false), [])

  return (
    <React.Fragment>
      <div ref={containerRef}>
        <DiscButton
          element="div"
          description="Preferences"
          label="Preferences"
          onClick={handleToggle}
          css={`
            && {
              width: ${4.25 * GU}px;
              height: ${4.25 * GU}px;
              padding: ${0.5 * GU}px;
              background: ${theme.backgroundInverted};
              height: 100%;
              border-radius: 50% 50%;
            }
          `}
        >
          <IconPerson
            css={`
              color: ${theme.background};
              width: ${3.25 * GU}px;
              height: ${3.25 * GU}px;
            `}
          />
        </DiscButton>
      </div>
      <Popover
        closeOnOpenerFocus
        placement="bottom-end"
        onClose={handleClose}
        visible={opened}
        opener={containerRef.current}
      >
        <ul
          css={`
            /* Use 20px as the padding setting for popper is 10px */
            width: ${below('medium') ? `calc(100vw - 20px)` : `${30 * GU}px`};
            padding: 0;
            margin: 0;
            list-style: none;
            background: ${theme.surface};
            color: ${theme.content};
            border-radius: ${RADIUS}px;
          `}
        >
          <li
            css={`
              display: flex;
              align-items: center;
              height: ${4 * GU}px;
              padding-left: ${2 * GU}px;
              border-bottom: 1px solid ${theme.border};
              ${textStyle('label2')}
              color: ${theme.surfaceContentSecondary};
            `}
          >
            Preferences
          </li>
          <Item onClick={() => onLogout()} icon={IconCog} label="Logout" />
        </ul>
      </Popover>
    </React.Fragment>
  )
}

function Item({ icon, label, onClick }) {
  const theme = useTheme()

  return (
    <li
      css={`
        & + & {
          border-top: 1px solid ${theme.border};
        }
      `}
    >
      <ButtonBase
        onClick={onClick}
        label={label}
        css={`
          width: 100%;
          height: ${7 * GU}px;
          border-radius: 0;
        `}
      >
        <div
          css={`
            display: flex;
            width: 100%;
            height: 100%;
            padding: ${2 * GU}px;
            justify-content: left;
            align-items: center;

            &:active,
            &:focus {
              background: ${theme.surfacePressed};
            }
          `}
        >
          {icon && <img src={icon} alt="" />}
          <div
            css={`
              flex-grow: 1;
              display: flex;
              align-items: center;
              margin-left: ${icon ? 1 * GU : 0}px;
            `}
          >
            {label}
          </div>
        </div>
      </ButtonBase>
    </li>
  )
}
