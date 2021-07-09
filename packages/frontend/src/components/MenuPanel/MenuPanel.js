import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { animated, useSpring } from 'react-spring'
import { useViewport } from 'use-viewport'
import 'styled-components/macro'
import {
  ButtonBase,
  Spacer,
  useTheme,
  springs,
  GU,
  RADIUS,
} from '@pokt-foundation/ui'
import IconApp from 'components/MenuPanel/IconApp'
import IconNetwork from 'components/MenuPanel/IconNetwork'
import PortalLogo from '../../assets/portal_logo.svg'
import { log, shorten } from 'lib/utils'

const CHILD_INSTANCE_HEIGHT = 6 * GU

const MENU_ROUTES = [
  {
    icon: IconNetwork,
    id: '/home',
    label: 'Network',
  },
  {
    icon: IconApp,
    id: '/apps',
    label: 'Apps',
  },
]

const CREATE_APP_ROUTE = [
  {
    id: '/create',
    label: 'Create',
  },
]

function useActiveRouteName() {
  const { pathname } = useLocation()
  const [activeId, setActiveId] = useState(pathname)

  useEffect(() => {
    const id = pathname

    setActiveId(id)
  }, [pathname])

  return {
    activeId,
  }
}

export default function MenuPanel({ appsLoading = true, userApps = [] }) {
  const theme = useTheme()
  const { within } = useViewport()
  const { activeId } = useActiveRouteName()

  const compactMode = within(-1, 'medium')

  const instanceGroups = useMemo(() => {
    const groups = [[MENU_ROUTES[0]]]

    groups.push([MENU_ROUTES[1]])

    groups[1].push(
      ...userApps.map(({ name, id }) => ({
        label: name,
        id: `/app/${id}`,
        appId: id,
      }))
    )

    groups[1].push(...CREATE_APP_ROUTE)

    return groups
  }, [userApps])

  const renderInstanceGroup = useCallback(
    (group) => {
      const activeIndex = group.findIndex(({ id }) => activeId.includes(id))
      const isActive = activeIndex !== -1

      return (
        <MenuPanelGroup
          active={isActive}
          activeIndex={activeIndex}
          appsLoading={appsLoading}
          instances={group}
          key={group[0].id}
        />
      )
    },
    [activeId, appsLoading]
  )

  return (
    !compactMode && (
      <div
        css={`
          width: ${18 * GU}px;
          height: 100vh;
          padding: ${2 * GU}px 0;
          flex-grow: 0;
        `}
      >
        <div
          css={`
            width: ${17 * GU}px;
            height: 100vh;
            position: fixed;
            top: 0;
            left: 0;
            padding: ${2 * GU}px 0;
            background: linear-gradient(
              180deg,
              ${theme.surfaceGradient1} 0%,
              ${theme.surfaceGradient2} 100%
            );
            border-radius: 0px 20px 20px 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            flex-grow: 0;
          `}
        >
          <ButtonBase
            css={`
              && {
                width: ${6 * GU}px;
                height: ${6 * GU}px;
                position: relative;
                justify-self: center;
                &:active {
                  top: 1px;
                }
              }
            `}
          >
            <img src={PortalLogo} alt="Menu Icon" />
          </ButtonBase>
          <Spacer size={5 * GU} />
          {instanceGroups.map((group) => renderInstanceGroup(group))}
        </div>
      </div>
    )
  )
}

function MenuPanelGroup({ active, activeIndex, appsLoading, instances }) {
  const { openProgress } = useSpring({
    from: { openProgress: Number(appsLoading) },
    to: { openProgress: Number(active) },
    config: springs.smooth,
  })
  const { pathname } = useLocation()
  const history = useHistory()
  const theme = useTheme()

  const [primaryInstance, ...childInstances] = instances

  const handleInstanceClick = useCallback(() => {
    if (!childInstances.length) {
      history.push({
        pathname: `${primaryInstance.id}`,
      })
      return
    }

    const [nextInstance] = childInstances

    history.push({
      pathname: `${nextInstance.id}`,
    })
  }, [childInstances, history, primaryInstance])

  const activeChildInstanceIndex = childInstances.reduce(
    (activeIndex, { appId }, index) => {
      if (pathname.includes('create')) {
        return childInstances.length - 1
      }

      if (!pathname.includes(appId) && activeIndex === -1) {
        return -1
      }

      if (pathname.includes(appId)) {
        return index
      }

      if (activeIndex !== -1) {
        return activeIndex
      }
    },
    -1
  )

  log(activeIndex, childInstances, 'activeIndeex')

  return (
    <div
      css={`
        position: relative;
        width: 100%;
        min-height: ${10 * GU}px;
        color: ${theme.content};
        display: flex;
        flex-direction: column;
        align-items: center;
      `}
    >
      <animated.div
        css={`
          position: absolute;
          left: 0;
          top: 0;
          width: ${GU / 2}px;
          height: ${11 * GU}px;
          background: ${theme.accent};
          border-radius: ${RADIUS}px;
        `}
        style={{
          opacity: openProgress,
          transform: openProgress.interpolate(
            (v) => `translate3d(-${(1 - v) * 100}%, 0, 0)`
          ),
        }}
      />
      <MenuPanelButton
        active={active}
        instance={primaryInstance}
        onClick={handleInstanceClick}
      />
      {childInstances.length ? (
        <animated.ul
          css={`
            overflow: hidden;
            list-style: none;
            width: 100%;
          `}
          style={{
            height: openProgress.interpolate(
              (v) =>
                `${childInstances.length * (CHILD_INSTANCE_HEIGHT + GU) * v}px`
            ),
          }}
        >
          {childInstances.map(({ id, label }, index) => (
            <>
              <Spacer size={1 * GU} />
              <li
                key={id}
                css={`
                  width: 100%;
                `}
              >
                <ButtonBase
                  onClick={() => history.push({ pathname: `${id}` })}
                  css={`
                    && {
                      background: ${activeChildInstanceIndex === index
                        ? `linear-gradient(90.3deg, ${theme.accent} -434.38%, rgba(197, 236, 75, 0) 99.62%)`
                        : 'transparent'};
                      display: flex;
                      align-items: center;
                      border-radius: 0px;
                      text-align: left;
                      height: ${6 * GU}px;
                      width: 100%;
                      font-weight: ${active ? 'bold' : 'normal'};
                      transition: background 150ms ease-in-out;
                    }
                  `}
                >
                  <span
                    css={`
                      width: 100%;
                      overflow: hidden;
                      white-space: nowrap;
                      text-overflow: ellipsis;
                      text-align: center;
                    `}
                  >
                    {shorten(label, 10)}
                  </span>
                </ButtonBase>
              </li>
            </>
          ))}
        </animated.ul>
      ) : (
        ''
      )}
    </div>
  )
}

function MenuPanelButton({ active, instance, onClick, ...props }) {
  const theme = useTheme()

  const InstanceIcon = instance.icon

  return (
    <ButtonBase
      css={`
        && {
          background: ${active
            ? `linear-gradient(90.3deg, ${theme.accent} -434.38%, rgba(197, 236, 75, 0) 99.62%)`
            : 'transparent'};
          width: 100%;
          height: ${11 * GU}px;
          padding-top: ${1 * GU}px;
          border-radius: 0px;
          color: ${theme.content};
          transition: background 150ms ease-in-out;
        }
      `}
      onClick={onClick}
      {...props}
    >
      <div
        css={`
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          img {
            display: block;
            width: ${5 * GU}px;
            height: ${5 * GU}px;
          }
        `}
      >
        <InstanceIcon color={theme.content} />
        <Spacer size={1 * GU} />
        {instance.label}
      </div>
    </ButtonBase>
  )
}

MenuPanelButton.propTypes = {
  icon: PropTypes.string,
  label: PropTypes.string,
  onClcik: PropTypes.func,
}
