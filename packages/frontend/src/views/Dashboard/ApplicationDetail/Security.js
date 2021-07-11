import React, { useCallback, useEffect, useState } from 'react'
import { useHistory } from 'react-router'
import { useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import * as Sentry from '@sentry/react'
import 'styled-components/macro'
import {
  Button,
  ButtonBase,
  IconPlus,
  IconCross,
  Spacer,
  Split,
  Switch,
  TextCopy,
  TextInput,
  textStyle,
  useToast,
  GU,
} from '@pokt-foundation/ui'
import Box from 'components/Box/Box'
import FloatUp from 'components/FloatUp/FloatUp'
import env from 'environment'
import {
  KNOWN_MUTATION_SUFFIXES,
  KNOWN_QUERY_SUFFIXES,
} from 'known-query-suffixes'
import { sentryEnabled } from 'sentry'
import AppStatus from 'components/AppStatus/AppStatus'

const ADDORNMENT_SETTINGS = {
  width: 36,
  padding: 4,
}

export default function Security({ appData, stakedTokens, maxDailyRelays }) {
  const [origin, setOrigin] = useState('')
  const [origins, setOrigins] = useState([])
  const [secretKeyRequired, setSecretKeyRequired] = useState(false)
  const [userAgent, setUserAgent] = useState('')
  const [userAgents, setUserAgents] = useState([])
  const history = useHistory()
  const toast = useToast()
  const queryClient = useQueryClient()

  useEffect(() => {
    setUserAgents((agents) => {
      const currentUserAgents = appData.gatewaySettings.whitelistUserAgents
        .length
        ? [...appData.gatewaySettings.whitelistUserAgents]
        : []

      const filteredStateUserAgents = agents.filter(
        (a) => !currentUserAgents.includes(a)
      )

      return [...currentUserAgents, ...filteredStateUserAgents]
    })
    setOrigins((origins) => {
      const currentOrigins = appData.gatewaySettings.whitelistOrigins.length
        ? [...appData.gatewaySettings.whitelistOrigins]
        : []

      const filteredStateOrigins = origins.filter(
        (o) => !currentOrigins.includes(o)
      )

      return [...currentOrigins, ...filteredStateOrigins]
    })
    setSecretKeyRequired(appData.gatewaySettings.secretKeyRequired)
  }, [appData])

  const { mutate } = useMutation(async function updateApplicationSettings() {
    const path = `${env('BACKEND_URL')}/api/${
      appData.isLb ? 'lb' : 'applications'
    }/${appData.id}`

    try {
      await axios.put(
        path,
        {
          gatewaySettings: {
            whitelistOrigins: origins,
            whitelistUserAgents: userAgents,
            secretKeyRequired,
          },
        },
        {
          withCredentials: true,
        }
      )

      queryClient.invalidateQueries(KNOWN_QUERY_SUFFIXES.USER_APPS)

      toast('Security preferences updated')
      history.goBack()
    } catch (err) {
      if (sentryEnabled) {
        Sentry.configureScope((scope) => {
          scope.setTransactionName(
            `QUERY ${KNOWN_MUTATION_SUFFIXES.SECURITY_UPDATE_MUTATION}`
          )
        })
        Sentry.captureException(err)
      }
      throw err
    }
  })

  const onSecretKeyRequiredChange = useCallback(() => {
    setSecretKeyRequired((r) => !r)
  }, [])
  const setWhitelistedUserAgent = useCallback(() => {
    if (userAgent) {
      setUserAgents((userAgents) => [...userAgents, userAgent])
    }
    setUserAgent('')
  }, [userAgent])
  const setWhitelistedOrigin = useCallback(() => {
    if (origin) {
      setOrigins((origins) => [...origins, origin])
    }
    setOrigin('')
  }, [origin])
  const onDeleteUserAgentClick = useCallback((userAgent) => {
    setUserAgents((userAgents) => [
      ...userAgents.filter((u) => u !== userAgent),
    ])
  }, [])
  const onDeleteOriginClick = useCallback((origin) => {
    setOrigins((origins) => [...origins.filter((o) => o !== origin)])
  }, [])

  return (
    <FloatUp
      content={() => (
        <>
          <Split
            primary={
              <>
                <Box>
                  <p
                    css={`
                      ${textStyle('body2')}
                    `}
                  >
                    Set up usage alerts to be warned when you are approaching
                    your relay limits. The Portal automatically redirects all
                    surplus relays to our backup infrastructure. If you want all
                    relays to be unstoppable, stay under your limit or contact
                    the team to up your stake.
                  </p>
                </Box>
                <Spacer size={3 * GU} />
                <Box
                  css={`
                    display: flex;
                    flex-direction: row;
                    justify-content: space-between;
                    align-items: center;
                  `}
                >
                  <div
                    css={`
                      display: flex;
                      justify-content: space-between;
                      align-items: center;
                    `}
                  >
                    <h3
                      css={`
                        ${textStyle('title2')}
                      `}
                    >
                      Private Secret Key Required
                    </h3>
                  </div>
                  <Switch
                    checked={secretKeyRequired}
                    onChange={onSecretKeyRequiredChange}
                  />
                </Box>
                <Spacer size={3 * GU} />
                <Box
                  title="Whitelisted User-Agents"
                  css={`
                    h3 {
                      margin-bottom: ${2 * GU}px;
                    }
                    margin-bottom: ${3 * GU}px;
                  `}
                >
                  <TextInput
                    wide
                    value={userAgent}
                    onChange={(e) => setUserAgent(e.target.value)}
                    adornment={
                      <ButtonBase onClick={setWhitelistedUserAgent}>
                        <IconPlus />
                      </ButtonBase>
                    }
                    adornmentPosition="end"
                  />
                  <ul
                    css={`
                      list-style: none;
                      margin-top: ${2 * GU}px;
                      li:not(:last-child) {
                        margin-bottom: ${2 * GU}px;
                      }
                    `}
                  >
                    {userAgents.map((agent, index) => (
                      <li key={agent}>
                        <TextCopy
                          key={`${agent}/${index}`}
                          onCopy={() => onDeleteUserAgentClick(agent)}
                          value={agent}
                          adornment={<IconCross />}
                          adornmentSettings={ADDORNMENT_SETTINGS}
                          css={`
                            width: 100%;
                            padding-left: 0;
                          `}
                        />
                      </li>
                    ))}
                  </ul>
                </Box>
                <Box
                  title="Whitelisted Origins"
                  css={`
                    h3 {
                      margin-bottom: ${2 * GU}px;
                    }
                  `}
                >
                  <TextInput
                    wide
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    adornment={
                      <ButtonBase onClick={setWhitelistedOrigin}>
                        <IconPlus />
                      </ButtonBase>
                    }
                    adornmentSettings={ADDORNMENT_SETTINGS}
                    adornmentPosition="end"
                  />
                  <ul
                    css={`
                      list-style: none;
                      margin-top: ${2 * GU}px;
                      li:not(:last-child) {
                        margin-bottom: ${2 * GU}px;
                      }
                    `}
                  >
                    {origins.map((origin, index) => (
                      <li key={origin}>
                        <TextCopy
                          key={`${origin}/${index}`}
                          adornment={<IconCross />}
                          onCopy={() => onDeleteOriginClick(origin)}
                          value={origin}
                          css={`
                            width: 100%;
                          `}
                        />
                      </li>
                    ))}
                  </ul>
                </Box>
              </>
            }
            secondary={
              <>
                <Button wide mode="strong" onClick={mutate}>
                  Save Changes
                </Button>
                <Spacer size={2 * GU} />
                <Button wide onClick={() => history.goBack()}>
                  Go Back
                </Button>
                <Spacer size={2 * GU} />
                <AppStatus
                  stakedTokens={stakedTokens}
                  maxDailyRelays={maxDailyRelays}
                />
              </>
            }
          />
        </>
      )}
    />
  )
}
