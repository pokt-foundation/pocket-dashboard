import React, { useCallback, useMemo, useState } from 'react'
import { useHistory, useRouteMatch } from 'react-router'
import { animated, useSpring } from 'react-spring'
import * as dayjs from 'dayjs'
import * as dayJsutcPlugin from 'dayjs/plugin/utc'
import { useViewport } from 'use-viewport'
import 'styled-components/macro'
import {
  Banner,
  BarChart,
  Button,
  ButtonBase,
  CircleGraph,
  DataView,
  LineChart,
  Link,
  Modal,
  Pagination,
  Spacer,
  Split,
  TextCopy,
  color,
  textStyle,
  useTheme,
  useToast,
  GU,
  RADIUS,
} from '@pokt-foundation/ui'
import AppStatus from 'components/AppStatus/AppStatus'
import Box from 'components/Box/Box'
import FloatUp from 'components/FloatUp/FloatUp'
import SuccessIndicator from 'views/Dashboard/ApplicationDetail/SuccessIndicator'
import { useLatestRelays } from 'hooks/application-hooks'
import { prefixFromChainId } from 'lib/chain-utils'
import { norm } from 'lib/math-utils'
import { formatNumberToSICompact } from 'lib/formatting-utils'

const ONE_MILLION = 1000000
const ONE_SECOND = 1 // Data for graphs come in second
const PER_PAGE = 10
const SESSIONS_PER_DAY = 24

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const HIGHLIGHT_COLORS = ['#D27E31', '#55B02B', '#BB31D2', '#31ABD2', '#D2CC31']

const DEFAULT_EMPTY_RELAYS = [
  {
    dailyRelays: 0,
  },
  {
    dailyRelays: 0,
  },
]

const FALLBACK_COLOR = '#C4C4C4'

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

function useSuccessRateColor(successRate) {
  if (successRate >= 0.8) {
    return ['#034200', '#55b02b']
  } else {
    return ['#881d26', '#ff0003']
  }
}

function formatDailyRelaysForGraphing(
  dailyRelays = [],
  upperBound = ONE_MILLION
) {
  const labels = dailyRelays
    .map(({ bucket }) => bucket.split('T')[0])
    .map((bucket) => DAYS[new Date(bucket).getUTCDay()])

  const processedDailyRelays =
    dailyRelays.length === 1
      ? [...dailyRelays, { dailyRelays: 0 }]
      : dailyRelays.length === 0
      ? DEFAULT_EMPTY_RELAYS
      : dailyRelays

  const lines = [
    {
      id: 1,
      values: processedDailyRelays.map(({ dailyRelays }) =>
        norm(dailyRelays, 0, upperBound)
      ),
    },
  ]

  const scales = [
    { label: '0' },
    { label: formatNumberToSICompact(upperBound * 0.25) },
    { label: formatNumberToSICompact(upperBound * 0.5) },
    { label: formatNumberToSICompact(upperBound * 0.75) },
    {
      label: formatNumberToSICompact(upperBound),
      highlightColor: '#AE1515',
    },
    { label: '' },
  ]

  return {
    labels,
    lines,
    scales,
  }
}

const DEFAULT_LATENCY_LABELS = Array(24)
  .fill('')
  .map((_) => '00')

const DEFAULT_LATENCY_SCALE = [
  { label: '0ms' },
  { label: '250ms' },
  { label: '500ms' },
  { label: '750ms' },
  { label: '1000ms', highlightColor: '#AE1515' },
  { label: '' },
]

const DEFAULT_LATENCY_VALUES = [
  {
    id: 1,
    values: Array(24).fill(0),
  },
]

function formatLatencyValuesForGraphing(
  hourlyLatency = [],
  upperBound = ONE_SECOND
) {
  if (!hourlyLatency.length) {
    return {
      barValues: DEFAULT_LATENCY_VALUES,
      labels: DEFAULT_LATENCY_LABELS,
      scales: DEFAULT_LATENCY_SCALE,
    }
  }

  dayjs.extend(dayJsutcPlugin)

  const labels =
    hourlyLatency.length > 0
      ? hourlyLatency
          .map(({ bucket }) => {
            return bucket.split('T')[1]
          })
          .map((bucket) => bucket.substring(0, 2))
      : Array(24)
          .fill('')
          .map(() => '00')

  while (labels.length < 24) {
    labels.push('--')
  }

  const boundedLatencyValues = hourlyLatency.map(({ latency }) =>
    norm(latency, 0, upperBound)
  )

  while (boundedLatencyValues.length < 24) {
    boundedLatencyValues.push(0)
  }

  const barValues = [
    {
      id: 1,
      values: boundedLatencyValues,
    },
  ]

  const scales = DEFAULT_LATENCY_SCALE

  return {
    barValues,
    labels,
    scales,
  }
}

export default function AppInfo({
  appData,
  currentSessionRelays,
  dailyRelayData,
  maxDailyRelays,
  previousSuccessfulRelays,
  previousRelays,
  stakedTokens,
  successfulRelayData,
  weeklyRelayData,
  latestLatencyData,
}) {
  const [networkModalVisible, setNetworkModalVisible] = useState(false)
  const [networkDenialModalVisible, setNetworkDenialModalVisible] = useState(
    false
  )
  const history = useHistory()
  const { url } = useRouteMatch()
  const { within } = useViewport()

  const compactMode = within(-1, 'medium')

  const successRate = useMemo(() => {
    return weeklyRelayData.total_relays === 0
      ? 0
      : successfulRelayData.total_relays / weeklyRelayData.total_relays
  }, [weeklyRelayData, successfulRelayData])
  const previousSuccessRate = useMemo(() => {
    return previousSuccessfulRelays === 0
      ? 0
      : previousSuccessfulRelays / previousRelays
  }, [previousSuccessfulRelays, previousRelays])

  const {
    labels: usageLabels = [],
    lines: usageLines = [],
    scales: usageScales,
  } = useMemo(
    () => formatDailyRelaysForGraphing(dailyRelayData, maxDailyRelays),
    [maxDailyRelays, dailyRelayData]
  )

  const {
    labels: latencyLabels = [],
    barValues = [],
    scales: latencyScales = [],
  } = useMemo(() => formatLatencyValuesForGraphing(latestLatencyData, 1.25), [
    latestLatencyData,
  ])

  const avgLatency = useMemo(() => {
    if (!latestLatencyData.length) {
      return 0
    }
    return (
      latestLatencyData.reduce((avg, { latency }) => {
        return avg + latency
      }, 0) / latestLatencyData.length
    )
  }, [latestLatencyData])

  const isSwitchable = useMemo(() => {
    dayjs.extend(dayJsutcPlugin)
    const today = dayjs.utc()
    const appLastUpdated = dayjs.utc(appData.updatedAt ?? appData.createdAt)

    const diff = today.diff(appLastUpdated, 'day')

    return diff >= 7
  }, [appData])

  const exceedsMaxRelays = useMemo(() => {
    const todaysRelays = dailyRelayData[dailyRelayData.length - 1] ?? {
      dailyRelays: 0,
    }
    const { dailyRelays = 0 } = todaysRelays

    return dailyRelays >= maxDailyRelays
  }, [dailyRelayData, maxDailyRelays])

  const exceedsSessionRelays = useMemo(() => {
    return currentSessionRelays >= maxDailyRelays / 24
  }, [currentSessionRelays, maxDailyRelays])

  const onCloseNetworkModal = useCallback(
    () => setNetworkModalVisible(false),
    []
  )
  const onCloseDenialModal = useCallback(
    () => setNetworkDenialModalVisible(false),
    []
  )

  const onOpenModal = useCallback(() => {
    if (isSwitchable) {
      setNetworkModalVisible(true)
    } else {
      setNetworkDenialModalVisible(true)
    }
  }, [isSwitchable])

  const onSwitchChains = useCallback(() => {
    history.push(`${url}/chains`)
  }, [history, url])

  return (
    <FloatUp
      content={() => (
        <>
          <Split
            primary={
              <>
                <EndpointDetails
                  chainId={appData.chain}
                  appId={appData.id}
                  isLb={appData.isLb}
                />
                <Spacer size={3 * GU} />
                {exceedsMaxRelays && (
                  <>
                    <Banner
                      mode="warning"
                      title="It's time to up your stake; your app is over the daily limit"
                    >
                      Don't worry, we've got you covered. To maintain service,
                      the Portal automatically redirects all surplus relays to
                      our backup infrastructure. If you want all relays to be
                      served by Pocket Network, you'll need to stake more POKT.
                      Please{' '}
                      <Link href="mailto:sales@pokt.network">
                        contact the team
                      </Link>{' '}
                      for further assistance.
                    </Banner>
                    <Spacer size={2 * GU} />
                  </>
                )}
                {!exceedsMaxRelays && exceedsSessionRelays && (
                  <>
                    <Banner
                      mode="warning"
                      title="It's time to up your stake; your app is over the session limit"
                    >
                      Don't worry, we've got you covered. To maintain service,
                      the Portal automatically redirects all surplus relays to
                      our backup infrastructure. If you want all relays to be
                      served by Pocket Network, you'll need to stake more POKT.
                      Please{' '}
                      <Link href="mailto:sales@pokt.network">
                        contact the team
                      </Link>{' '}
                      for further assistance.
                    </Banner>
                    <Spacer size={3 * GU} />
                  </>
                )}
                <div
                  css={`
                    width: 100%;
                    height: ${compactMode ? 'auto' : '250px'};
                    display: grid;
                    grid-template-columns: ${compactMode ? '1fr' : '1fr 1fr'};
                    grid-column-gap: ${4 * GU}px;
                  `}
                >
                  <SuccessRate
                    appId={appData.id}
                    previousSuccessRate={previousSuccessRate}
                    successRate={successRate}
                    totalRequests={weeklyRelayData.total_relays}
                  />
                  <AvgLatency
                    avgLatency={avgLatency}
                    chartLines={barValues}
                    chartLabels={latencyLabels}
                    chartScales={latencyScales}
                  />
                </div>
                <Spacer size={3 * GU} />
                <UsageTrends
                  chartLabels={usageLabels}
                  chartLines={usageLines}
                  chartScales={usageScales}
                  maxSessionRelays={maxDailyRelays / SESSIONS_PER_DAY}
                  sessionRelays={currentSessionRelays}
                />
                <Spacer size={3 * GU} />
                <LatestRequests id={appData.id} isLb={appData.isLb} />
              </>
            }
            secondary={
              <>
                <Button mode="strong" wide onClick={onOpenModal}>
                  Switch chains
                </Button>
                <Spacer size={2 * GU} />
                <Button wide onClick={() => history.push(`${url}/security`)}>
                  App Security
                </Button>
                <Spacer size={2 * GU} />
                <Button
                  wide
                  onClick={() => history.push(`${url}/notifications`)}
                >
                  Notification Setup
                </Button>
                <Spacer size={3 * GU} />
                <AppStatus
                  stakedTokens={stakedTokens}
                  maxDailyRelays={maxDailyRelays}
                />
                <Spacer size={3 * GU} />
                <AppDetails
                  apps={appData.apps}
                  id={appData.id}
                  secret={appData.gatewaySettings.secretKey}
                />
              </>
            }
          />
          <SwitchInfoModal
            onClose={onCloseNetworkModal}
            onSwitch={onSwitchChains}
            visible={networkModalVisible}
          />
          <SwitchDenialModal
            onClose={onCloseDenialModal}
            visible={networkDenialModalVisible}
          />
        </>
      )}
    />
  )
}

function SwitchInfoModal({ onClose, onSwitch, visible }) {
  const { within } = useViewport()

  const compactMode = within(-1, 'medium')

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      css={`
        & > div > div > div > div {
          padding: 0 !important;
        }
      `}
    >
      <div
        css={`
          max-width: ${87 * GU}px;
        `}
      >
        <Banner
          mode="info"
          title="Free tier applications can only change networks once a week"
        >
          <p>
            This action will change your endpoint URL, which means you'll need
            to update it across your apps to maintain service. The previous
            endpoint will remain available for 24 hours before it is unstaked.
          </p>
        </Banner>
        <Spacer size={3 * GU} />
        <p
          css={`
            ${!compactMode && `text-align: center;`}
          `}
        >
          Do you want to continue?
        </p>
        <Spacer size={3 * GU} />
        <div
          css={`
            display: flex;
            ${compactMode && `flex-direction: column-reverse;`}
            justify-content: center;
            align-items: center;
            padding-left: ${2 * GU}px;
            padding-right: ${2 * GU}px;
          `}
        >
          <Spacer size={6 * GU} />
          <Button onClick={onClose} wide>
            Cancel
          </Button>
          <Spacer size={6 * GU} />
          <Button mode="strong" wide onClick={onSwitch}>
            Switch chains
          </Button>
          <Spacer size={6 * GU} />
        </div>
        <Spacer size={4 * GU} />
      </div>
    </Modal>
  )
}

function SwitchDenialModal({ onClose, visible }) {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      css={`
        & > div > div > div > div {
          padding: 0 !important;
        }
      `}
    >
      <div
        css={`
          max-width: ${87 * GU}px;
        `}
      >
        <Banner mode="warning" title="You've already switched chains this week">
          Once a week has elapsed you will be able to switch chains again. In
          the interim, we invite you to join our Discord community.
        </Banner>
      </div>
    </Modal>
  )
}

function EndpointDetails({ chainId, appId, isLb }) {
  const toast = useToast()
  const { prefix, name } = prefixFromChainId(chainId)
  const endpoint = `https://${prefix}.gateway.pokt.network/v1/${
    isLb ? 'lb/' : ''
  }${appId}`

  return (
    <Box>
      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
        `}
      >
        <h3
          css={`
            ${textStyle('title2')}
            margin-bottom: ${3 * GU}px;
          `}
        >
          Endpoint
        </h3>
        <h4
          css={`
            ${textStyle('body3')}
            font-weight: 600;
            margin-bottom: ${3 * GU}px;
          `}
        >
          {name}
        </h4>
      </div>
      <TextCopy
        value={endpoint}
        css={`
          width: 100%;
        `}
        onCopy={() => toast('Endpoint copied to clipboard')}
      />
    </Box>
  )
}

function SuccessRate({ previousSuccessRate = 0, successRate, totalRequests }) {
  const history = useHistory()
  const { url } = useRouteMatch()
  const theme = useTheme()
  const numberProps = useSpring({
    number: Math.min(successRate * 100, 100),
    from: { number: 0 },
  })
  const [primarySuccessColor] = useSuccessRateColor(successRate)
  const successRateDelta = useMemo(() => {
    if (successRate >= 0.9999) {
      return (0).toFixed(2)
    }
    return (((successRate - previousSuccessRate) / 1) * 100).toFixed(2)
  }, [previousSuccessRate, successRate])

  const mode = successRateDelta > 0 ? 'positive' : 'negative'

  return (
    <Box
      padding={[0, 0, 0, 0]}
      css={`
        display: flex;
        flex-direction: column;
      `}
    >
      <div
        css={`
          position: relative;
          background: linear-gradient(
            180deg,
            ${primarySuccessColor} -20.71%,
            ${color(primarySuccessColor).alpha(0)} 113.05%
          );
          height: ${12 * GU}px;
          border-radius: ${1 * GU}px ${1 * GU}px 0 0;
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <animated.h2
          css={`
            font-size: ${6 * GU}px;
            font-weight: bold;
          `}
        >
          {numberProps.number.interpolate((x) => `${x.toFixed(2)}%`)}
        </animated.h2>
      </div>
      <div
        css={`
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: ${1 * GU}px ${3 * GU}px ${1 * GU}px ${3 * GU}px;
        `}
      >
        <div
          css={`
            width: 100%;
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
            Success Rate
          </h3>
          <div
            css={`
              display: flex;
              flex-direction: column;
              align-items: flex-end;
            `}
          >
            <div
              css={`
                display: flex;
                align-items: center;
              `}
            >
              {totalRequests ? <SuccessIndicator mode={mode} /> : ''}
              <Spacer size={GU / 2} />
              <span
                css={`
                  ${textStyle('body3')};
                  font-weight: 800;
                `}
              >
                {Math.abs(successRateDelta)}%
              </span>
            </div>
            <p
              css={`
                ${textStyle('body4')}
              `}
            >
              Last 24 hours
            </p>
          </div>
        </div>
        <Spacer size={1 * GU} />
        <div
          css={`
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          `}
        >
          <h3
            css={`
              ${textStyle('title3')}
              font-weight: 700;
            `}
          >
            Total requests
          </h3>
          <h4
            css={`
              ${textStyle('body3')}
            `}
          >
            {Intl.NumberFormat().format(totalRequests)}
          </h4>
        </div>
      </div>

      <ButtonBase
        css={`
          && {
            bottom: 0;
            left: 0;
            width: 100%;
            height: ${5 * GU}px;
            border-top: 2px solid ${theme.accent};
            border-radius: 0 0 ${RADIUS}px ${RADIUS}px;
            color: ${theme.accent};
            font-weight: bold;
          }
        `}
        onClick={() => history.push(`${url}/success-details`)}
      >
        More Details
      </ButtonBase>
    </Box>
  )
}

function AvgLatency({ chartLabels, chartLines, avgLatency, chartScales }) {
  const theme = useTheme()

  return (
    <Box>
      <div
        css={`
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        `}
      >
        <h3
          css={`
            ${textStyle('title2')}
          `}
        >
          AVG Latency
        </h3>
        <p
          css={`
            ${textStyle('body1')}
          `}
        >
          {(avgLatency * 1000).toFixed(0)}ms
        </p>
      </div>
      <div>
        <BarChart
          lines={chartLines}
          label={chartLabels}
          height={200}
          color={() => theme.accentAlternative}
          scales={chartScales}
        />
      </div>
    </Box>
  )
}

function UsageTrends({
  chartLabels,
  chartLines,
  chartScales,
  maxSessionRelays,
  sessionRelays,
}) {
  const usageColor = useUsageColor(sessionRelays / maxSessionRelays)
  const theme = useTheme()
  const { within } = useViewport()
  const compactMode = within(-1, 'medium')

  return (
    <Box>
      <div
        css={`
          display: flex;
          justify-content: space-between;
        `}
      ></div>
      <div
        css={`
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: 30% 1fr;
          grid-column-gap: ${1 * GU}px;
          ${compactMode && `grid-template-columns: 1fr;`}
        `}
      >
        <div
          css={`
            display: flex;
            flex-direction: column;
            align-items: center;
            grid-column: 1;
            ${!compactMode && `border-right: 1px solid ${theme.background};`}
            ${compactMode &&
            `border-bottom: 1px solid ${theme.background}; padding-bottom: ${
              1 * GU
            }px;`}
          `}
        >
          <h3
            css={`
              ${textStyle('title2')}
              ${compactMode && `margin-top: ${1 * GU}px;`}
            `}
          >
            Current usage
          </h3>
          <Spacer size={5 * GU} />
          <CircleGraph
            value={Math.min(1, sessionRelays / maxSessionRelays)}
            size={140}
            color={usageColor}
          />
          <Spacer size={6 * GU} />
          <h4
            css={`
              ${textStyle('title2')}
              text-align: center;
            `}
          >
            {sessionRelays.toFixed(0)}
            <span
              css={`
                display: block;
                ${textStyle('body1')}
                font-weight: 700;
              `}
            >
              Relays this session
            </span>
          </h4>
        </div>
        <div
          css={`
            ${!compactMode && `grid-column: 2;`}
          `}
        >
          <h3
            css={`
              ${textStyle('title2')}
              ${compactMode && `text-align: center;`}
            `}
          >
            Weekly usage
          </h3>
          <LineChart
            lines={chartLines}
            label={(i) => chartLabels[i]}
            height={300}
            color={() => theme.accentAlternative}
            renderCheckpoints
            dotRadius={GU}
            threshold
            scales={chartScales}
          />
        </div>
      </div>
    </Box>
  )
}

function LatestRequests({ id, isLb }) {
  const [page, setPage] = useState(0)
  const { within } = useViewport()
  const { isLoading: isLatestRelaysLoading, latestRelayData } = useLatestRelays(
    {
      id,
      page,
      isLb: isLb,
    }
  )

  const onPageChange = useCallback((page) => setPage(page), [])
  const [colorsByMethod] = useMemo(() => {
    if (isLatestRelaysLoading) {
      return []
    }
    const latestRequests = latestRelayData
    const colorsByMethod = new Map()
    const countByColor = new Map()
    let id = 0

    for (const { method } of latestRequests) {
      if (!colorsByMethod.has(method)) {
        colorsByMethod.set(method, HIGHLIGHT_COLORS[id])
        if (id < HIGHLIGHT_COLORS.length - 1) {
          id++
        }
      }

      const methodColor = colorsByMethod.get(method)

      countByColor.has(methodColor)
        ? countByColor.set(methodColor, countByColor.get(methodColor) + 1)
        : countByColor.set(methodColor, 1)
    }

    const colorValues = [...colorsByMethod.values()]

    return [colorsByMethod, countByColor, colorValues]
  }, [isLatestRelaysLoading, latestRelayData])

  const compactMode = within(-1, 'medium')

  const latestRelays = useMemo(() => {
    return latestRelayData ? latestRelayData : []
  }, [latestRelayData])

  return (
    <Box
      title="Latest requests"
      css={`
        padding-bottom: ${4 * GU}px;
      `}
    >
      <DataView
        mode={compactMode ? 'list' : 'table'}
        fields={[
          { label: 'Request Type' },
          { label: 'Data transferred', align: 'left' },
          { label: 'Result', align: 'left' },
          { label: 'Time Elapsed', align: 'left' },
        ]}
        status={isLatestRelaysLoading ? 'loading' : 'default'}
        entries={latestRelays}
        renderEntry={({ bytes, method, result, elapsed_time: elapsedTime }) => {
          return [
            <p>{method ? method : 'Unknown'}</p>,
            <p>
              <span
                css={`
                  display: inline-block;
                  width: ${1.5 * GU}px;
                  height: ${1.5 * GU}px;
                  border-radius: 50% 50%;
                  background: ${colorsByMethod.get(method) ?? FALLBACK_COLOR};
                  box-shadow: ${colorsByMethod.get(method) ?? FALLBACK_COLOR}
                    0px 2px 8px 0px;
                `}
              />
              &nbsp;{bytes}B
            </p>,
            <p>{result}</p>,
            <p>{(elapsedTime * 1000).toFixed(0)}ms</p>,
          ]
        }}
      />
      <Pagination
        pages={PER_PAGE}
        selected={page}
        onChange={onPageChange}
        css={`
          grid-column: 2;
        `}
      />
    </Box>
  )
}

function AppDetails({ apps, id, secret }) {
  const toast = useToast()

  return (
    <Box
      css={`
        padding-bottom: ${4 * GU}px;
        div:not(:last-child) {
          margin-bottom: ${2 * GU}px;
        }
      `}
    >
      <div
        css={`
          width: 100%;
          display: flex;
          flex-direction: column;
        `}
      >
        <h3
          css={`
            ${textStyle('body1')};
            font-weight: 600;
            margin-bottom: ${2 * GU}px;
          `}
        >
          Gateway ID
        </h3>
        <TextCopy
          value={id}
          onCopy={() => toast('Gateway ID copied to clipboard')}
        />
      </div>
      <div
        css={`
          width: 100%;
          display: flex;
          flex-direction: column;
        `}
      >
        <h3
          css={`
            ${textStyle('body1')};
            font-weight: 600;
            margin-bottom: ${2 * GU}px;
          `}
        >
          App address{apps.length > 1 ? 'es' : ''}
        </h3>
        {apps.map(({ address }) => (
          <TextCopy
            value={address}
            onCopy={() => toast('App address copied to clipboard')}
          />
        ))}
      </div>
      {secret && (
        <div
          css={`
            width: 100%;
            display: flex;
            flex-direction: column;
          `}
        >
          <h3
            css={`
              ${textStyle('body1')};
              font-weight: 600;
              margin-bottom: ${2 * GU}px;
            `}
          >
            Secret Key
          </h3>
          <TextCopy
            value={secret}
            onCopy={() => toast('Secret key copied to clipboard')}
          />
        </div>
      )}
    </Box>
  )
}
