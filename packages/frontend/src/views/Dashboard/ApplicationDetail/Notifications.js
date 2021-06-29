import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { useMutation, useQueryClient } from 'react-query'
import axios from 'axios'
import { useViewport } from 'use-viewport'
import Styled from 'styled-components/macro'
import * as Sentry from '@sentry/react'
import {
  Button,
  CircleGraph,
  Link,
  Spacer,
  Split,
  Switch,
  textStyle,
  useTheme,
  useToast,
  GU,
  color,
} from '@pokt-foundation/ui'
import Box from 'components/Box/Box'
import FloatUp from 'components/FloatUp/FloatUp'
import { formatNumberToSICompact } from 'lib/formatting-utils'
import { log } from 'lib/utils'
import env from 'environment'
import {
  KNOWN_QUERY_SUFFIXES,
  KNOWN_MUTATION_SUFFIXES,
} from '../../../known-query-suffixes'
import { sentryEnabled } from 'sentry'

const GRAPH_SIZE = 130

const DEFAULT_PERCENTAGES = {
  quarter: false,
  half: false,
  threeQuarters: false,
  full: false,
}

function useUsageColor(usage) {
  const theme = useTheme()

  if (usage <= 0.25) {
    return theme.positive
  }

  if (usage <= 0.5) {
    return theme.yellow
  }

  if (usage <= 0.75) {
    return theme.warning
  }

  return theme.negative
}

export default function Notifications({
  appData,
  dailyRelays,
  maxDailyRelays,
  stakedTokens,
}) {
  const [chosenPercentages, setChosenPercentages] = useState(
    appData?.notificationSettings ?? DEFAULT_PERCENTAGES
  )
  const [hasChanged, setHasChanged] = useState(false)
  const history = useHistory()
  const { within } = useViewport()
  const toast = useToast()
  const { appId } = useParams()
  const queryClient = useQueryClient()
  const { isLoading: isNotificationsLoading, mutate } = useMutation(
    async function updateNotificationSettings() {
      const type = appData.isLb ? 'lb' : 'applications'
      const path = `${env('BACKEND_URL')}/api/${type}/notifications/${appId}`

      const { quarter, half, threeQuarters, full } = chosenPercentages

      try {
        await axios.put(
          path,
          {
            quarter,
            half,
            threeQuarters,
            full,
          },
          {
            withCredentials: true,
          }
        )

        queryClient.invalidateQueries(KNOWN_QUERY_SUFFIXES.USER_APPS)

        setHasChanged(false)
        toast('Notification preferences updated')
        history.goBack()
      } catch (err) {
        if (sentryEnabled) {
          Sentry.configureScope((scope) => {
            scope.setTransactionName(
              `QUERY ${KNOWN_MUTATION_SUFFIXES.SWITCH_CHAINS_MUTATION}`
            )
          })
          Sentry.captureException(err)
        }
        log('NOTIFICATION ERROR', Object.entries(err))
        throw err
      }
    }
  )

  const compactMode = within(-1, 'medium')

  const highestDailyAmount = useMemo(
    () =>
      dailyRelays.reduce(
        (highest, { dailyRelays }) => Math.max(highest, dailyRelays),
        0
      ),
    [dailyRelays]
  )

  const lowestDailyAmount = useMemo(
    () =>
      dailyRelays.length === 0
        ? 0
        : dailyRelays.reduce(
            (lowest, { dailyRelays }) => Math.min(lowest, dailyRelays),
            Number.POSITIVE_INFINITY
          ),
    [dailyRelays]
  )

  const totalDailyRelays = useMemo(() => {
    return dailyRelays.length === 0
      ? 0
      : dailyRelays.reduce((sum, { dailyRelays = 0 }) => sum + dailyRelays, 0) /
          dailyRelays.length
  }, [dailyRelays])

  const averageUsageColor = useUsageColor(totalDailyRelays / maxDailyRelays)
  const maxUsageColor = useUsageColor(highestDailyAmount / maxDailyRelays)
  const minUsageColor = useUsageColor(lowestDailyAmount / maxDailyRelays)

  const onChosePercentageChange = useCallback(
    (chosenPercentage) => {
      setHasChanged(true)
      setChosenPercentages({
        ...chosenPercentages,
        [chosenPercentage]: !chosenPercentages[chosenPercentage],
      })
    },
    [chosenPercentages]
  )

  const isSubmitDisabled = useMemo(
    () => isNotificationsLoading || !hasChanged,
    [hasChanged, isNotificationsLoading]
  )

  const maxRelays = formatNumberToSICompact(maxDailyRelays)

  return (
    <FloatUp
      loading={false}
      content={() => (
        <Split
          primary={
            <>
              <Box>
                <p
                  css={`
                    ${textStyle('body2')}
                  `}
                >
                  Set up your usage alert notifications so you're always aware
                  if you're close to maxing out on your alloted requests.
                </p>
              </Box>
              <Spacer size={2 * GU} />
              <Box>
                <div
                  css={`
                    display: flex;
                    justify-content: space-between;
                    align-items: center;

                    ${compactMode &&
                    `
                      flex-direction: column;
                      align-items: flex-start;
                    `}
                  `}
                >
                  <h2
                    css={`
                      ${textStyle('title2')}
                    `}
                  >
                    Weekly bandwith usage
                  </h2>
                  {compactMode && <Spacer size={1 * GU} />}
                  <h3>Max relays per day: {maxRelays}</h3>
                </div>
                <Spacer size={2 * GU} />
                <Inline>
                  <GraphContainer>
                    <CircleGraph
                      value={Math.min(totalDailyRelays / maxDailyRelays, 1)}
                      size={GRAPH_SIZE}
                      color={averageUsageColor}
                    />
                    <Spacer size={2 * GU} />
                    <Stack
                      css={`
                        display: flex;
                        flex-direction: column;
                      `}
                    >
                      <h3
                        css={`
                          ${textStyle('body3')}
                        `}
                      >
                        <span
                          css={`
                            display: block;
                            ${textStyle('title3')}
                            font-weight: 700;
                          `}
                        >
                          Average usage
                        </span>
                        {Intl.NumberFormat().format(
                          totalDailyRelays.toFixed(0)
                        )}{' '}
                        Relays
                      </h3>
                    </Stack>
                  </GraphContainer>
                  <Spacer size={2 * GU} />
                  <GraphContainer>
                    <CircleGraph
                      value={Math.min(highestDailyAmount / maxDailyRelays, 1)}
                      size={GRAPH_SIZE}
                      color={maxUsageColor}
                    />
                    <Spacer size={1 * GU} />
                    <Stack
                      css={`
                        display: flex;
                        flex-direction: column;
                      `}
                    >
                      <h3
                        css={`
                          ${textStyle('body3')}
                        `}
                      >
                        <span
                          css={`
                            display: block;
                            ${textStyle('title3')}
                            font-weight: 700;
                          `}
                        >
                          Max usage
                        </span>
                        {Intl.NumberFormat().format(highestDailyAmount)} Relays
                      </h3>
                    </Stack>
                  </GraphContainer>
                  <Spacer size={2 * GU} />
                  <GraphContainer>
                    <CircleGraph
                      value={lowestDailyAmount / maxDailyRelays}
                      size={GRAPH_SIZE}
                      color={minUsageColor}
                    />
                    <Spacer size={1 * GU} />
                    <Stack
                      css={`
                        display: flex;
                        flex-direction: column;
                      `}
                    >
                      <h3
                        css={`
                          ${textStyle('body3')}
                        `}
                      >
                        <span
                          css={`
                            display: block;
                            ${textStyle('title3')}
                            font-weight: 700;
                          `}
                        >
                          Min usage
                        </span>
                        {Intl.NumberFormat().format(lowestDailyAmount)} Relays
                      </h3>
                    </Stack>
                  </GraphContainer>
                </Inline>
                <Spacer size={2 * GU} />
                <p
                  css={`
                    ${textStyle('body4')}
                  `}
                >
                  These values are calculated on a period of 7 days.
                </p>
              </Box>
              <Spacer size={2.5 * GU} />
              <p
                css={`
                  ${textStyle('body3')}
                `}
              >
                If you need more relays for your application or you are looking
                to stake your own POKT or please{' '}
                <Link href="https://pocketnetwork.typeform.com/to/UPb0xJhS">
                  contact us
                </Link>{' '}
                and our team will find a solution for you.
              </p>
            </>
          }
          secondary={
            <>
              <Button
                wide
                mode="strong"
                onClick={mutate}
                disabled={isSubmitDisabled}
              >
                Save changes
              </Button>
              <Spacer size={2 * GU} />
              <Button wide onClick={() => history.goBack()}>
                Back to application
              </Button>
              <Spacer size={2 * GU} />
              <Box title="Notification preferences">
                <p
                  css={`
                    ${textStyle('body2')}
                  `}
                >
                  Whenever an app reaches one of the bandwith thresholds defined
                  below, we'll send an email notifying you about it.
                </p>
              </Box>
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="quarter"
                checked={chosenPercentages.quarter}
                onChange={() => onChosePercentageChange('quarter')}
                maxRelays={maxRelays}
              />
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="half"
                checked={chosenPercentages.half}
                onChange={() => onChosePercentageChange('half')}
                maxRelays={maxRelays}
              />
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="threeQuarters"
                checked={chosenPercentages.threeQuarters}
                onChange={() => onChosePercentageChange('threeQuarters')}
                maxRelays={maxRelays}
              />
              <Spacer size={2 * GU} />
              <NotificationPreference
                level="full"
                checked={chosenPercentages.full}
                onChange={() => onChosePercentageChange('full')}
                maxRelays={maxRelays}
              />
            </>
          }
        />
      )}
    />
  )
}

function NotificationPreference({ level, checked, onChange, maxRelays }) {
  const theme = useTheme()

  const backgroundColor = useMemo(() => {
    if (level === 'quarter') {
      return theme.positive
    } else if (level === 'half') {
      return theme.yellow
    } else if (level === 'threeQuarters') {
      return theme.warning
    } else {
      return theme.negative
    }
  }, [level, theme])

  const usagePercentage = useMemo(() => {
    if (level === 'quarter') {
      return '25%'
    } else if (level === 'half') {
      return '50%'
    } else if (level === 'threeQuarters') {
      return '75%'
    } else {
      return '100%'
    }
  }, [level])

  return (
    <Box padding={[2 * GU, 2 * GU, 2 * GU, 4 * GU]}>
      <div
        css={`
          position: absolute;
          left: 0;
          top: 0;
          width: ${1.5 * GU}px;
          height: 100%;
          background: linear-gradient(
            90deg,
            ${backgroundColor} 2.32%,
            ${color(backgroundColor).alpha(0)} 88.51%
          );
          border-radius: ${1 * GU}px 0px 0px ${1 * GU}px;
        `}
      />
      <div
        css={`
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <h3
          css={`
            ${textStyle('title3')}
          `}
        >
          {usagePercentage}&nbsp;
          <span
            css={`
              ${textStyle('body3')}
            `}
          >
            of {maxRelays} relays
          </span>
        </h3>
        <Switch checked={checked} onChange={onChange} />
      </div>
    </Box>
  )
}

function Inline({ children }) {
  const { within } = useViewport()
  const compactMode = within(-1, 'medium')

  return (
    <div
      css={`
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        flex-wrap: wrap;
        ${compactMode &&
        `
          flex-direction: column;
          align-items: flex-start;
        `}
      `}
    >
      {children}
    </div>
  )
}

const GraphContainer = Styled.div`
  display: flex;
  flex-direction: column;
`

const Stack = Styled.div`
  display: flex;
  flex-direction: column;
`
