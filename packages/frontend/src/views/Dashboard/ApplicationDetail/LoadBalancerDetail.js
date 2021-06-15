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
  Modal,
  Pagination,
  Spacer,
  Split,
  TextCopy,
  textStyle,
  useTheme,
  useToast,
  GU,
  RADIUS,
} from 'ui'
import AppStatus from 'components/AppStatus/AppStatus'
import Box from 'components/Box/Box'
import FloatUp from 'components/FloatUp/FloatUp'
import SuccessIndicator from 'views/Dashboard/ApplicationDetail/SuccessIndicator'
import { useLatestRelays } from 'views/Dashboard/application-hooks'
import { prefixFromChainId } from 'lib/chain-utils'
import { norm } from 'lib/math-utils'
import { getThresholdsPerStake } from 'lib/pocket-utils'
import env from '../../../environment'

const MAX_RELAYS_PER_SESSION = 40000
const ONE_MILLION = 1000000
const ONE_SECOND = 1 // Data for graphs come in second
const PER_PAGE = 10

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

  return {
    labels,
    lines,
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
  appOnChainData,
  currentSessionRelays,
  dailyRelayData,
  previousSuccessfulRelays,
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
  const { staked_tokens: stakedTokens } = appOnChainData
  const {
    freeTierApplicationAccount: { publicKey = env('TEST_APP_PUB_KEY') },
  } = appData

  const { graphThreshold, maxRelays } = getThresholdsPerStake(stakedTokens)

  const successRate = useMemo(() => {
    return weeklyRelayData.weeklyAppRelays === 0
      ? 0
      : successfulRelayData.successfulWeeklyRelays /
          weeklyRelayData.weeklyAppRelays
  }, [weeklyRelayData, successfulRelayData])
  const previousSuccessRate = useMemo(() => {
    return previousSuccessfulRelays.previousTotalRelays === 0
      ? 0
      : previousSuccessfulRelays.successfulWeeklyRelays /
          previousSuccessfulRelays.previousTotalRelays
  }, [previousSuccessfulRelays])

  const { labels: usageLabels = [], lines: usageLines = [] } = useMemo(
    () => formatDailyRelaysForGraphing(dailyRelayData, graphThreshold),
    [dailyRelayData, graphThreshold]
  )
  const {
    labels: latencyLabels = [],
    barValues = [],
    scales: latencyScales = [],
  } = useMemo(() => formatLatencyValuesForGraphing(latestLatencyData, 1.25), [
    latestLatencyData,
  ])

  const isSwitchable = useMemo(() => {
    dayjs.extend(dayJsutcPlugin)
    const today = dayjs.utc()
    const appCreationDate = dayjs.utc(appData.createdAt)

    const diff = today.diff(appCreationDate, 'day')

    return diff >= 7
  }, [appData])

  const exceedsMaxRelays = useMemo(() => {
    const todaysRelays = dailyRelayData[dailyRelayData.length - 1] ?? {
      dailyRelays: 0,
    }
    const { dailyRelays = 0 } = todaysRelays

    return dailyRelays >= maxRelays
  }, [dailyRelayData, maxRelays])

  const exceedsSessionRelays = useMemo(() => {
    return currentSessionRelays >= MAX_RELAYS_PER_SESSION
  }, [currentSessionRelays])

  const onCloseNetworkModal = useCallback(
    () => setNetworkModalVisible(false),
    []
  )
  const onCloseDenialModal = useCallback(
    () => setNetworkDenialModalVisible(false),
    []
  )

  const onOpenModal = useCallback(() => {
    if (!isSwitchable) {
      setNetworkDenialModalVisible(true)
    } else {
      setNetworkModalVisible(true)
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
                <EndpointDetails chainId={appData.chain} appId={appData._id} />
                <Spacer size={2 * GU} />
                {exceedsMaxRelays && (
                  <>
                    <Banner
                      mode="error"
                      title="Your application has reached the max limit of relays per day"
                    >
                      You should extend your app relays limit to keep the
                      service according to the demand. Contact our sales team to
                      find the best solution for you and keep your
                      infrastructure running.
                    </Banner>
                    <Spacer size={2 * GU} />
                  </>
                )}
                {!exceedsMaxRelays && exceedsSessionRelays && (
                  <>
                    <Banner
                      mode="error"
                      title="Your application has reached the max limit of relays per session"
                    >
                      You should extend your app relays limit to keep the
                      service according to the demand. Contact our sales team to
                      find the best solution for you and keep your
                      infrastructure running.
                    </Banner>
                    <Spacer size={2 * GU} />
                  </>
                )}
                <div
                  css={`
                    width: 100%;
                    height: ${compactMode ? 'auto' : '250px'};
                    display: grid;
                    grid-template-columns: ${compactMode ? '1fr' : '1fr 1fr'};
                    grid-column-gap: ${2 * GU}px;
                  `}
                >
                  <SuccessRate
                    appId={appData._id}
                    previousSuccessRate={previousSuccessRate}
                    successRate={successRate}
                    totalRequests={weeklyRelayData.weeklyAppRelays}
                  />
                  <AvgLatency
                    avgLatency={successfulRelayData.avgLatency}
                    chartLines={barValues}
                    chartLabels={latencyLabels}
                    chartScales={latencyScales}
                  />
                </div>
                <Spacer size={2 * GU} />
                <UsageTrends
                  chartLabels={usageLabels}
                  chartLines={usageLines}
                  sessionRelays={currentSessionRelays}
                  threshold={graphThreshold}
                />
                <Spacer size={2 * GU} />
                <LatestRequests publicKey={publicKey} />
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
                  Notifications
                </Button>
                <Spacer size={2 * GU} />
                <AppStatus appOnChainStatus={appOnChainData} />
                <Spacer size={2 * GU} />
                <AppDetails
                  id={appData._id}
                  pubkey={appData.freeTierApplicationAccount.publicKey}
                  secret={appData.gatewaySettings?.secretKey ?? ''}
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
    <Modal visible={visible} onClose={onClose}>
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
            to update it across your apps.
          </p>
          <Spacer size={2 * GU} />
          <p>
            This endpoint will remain available for 24 hours before it's
            unstaked.
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
  const { within } = useViewport()

  const compactMode = within(-1, 'medium')

  return (
    <Modal visible={visible} onClose={onClose}>
      <div
        css={`
          max-width: ${87 * GU}px;
        `}
      >
        <Banner mode="warning" title="You've already switched chains this week">
          Once a week has elapsed you will be able to switch chains again. In
          the interim, we invite you to join our Discord community.
        </Banner>
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
          <Button onClick={onClose} wide mode="strong">
            Cancel
          </Button>
          <Spacer size={6 * GU} />
        </div>
        <Spacer size={4 * GU} />
      </div>
    </Modal>
  )
}

function EndpointDetails({ chainId, appId }) {
  const toast = useToast()
  const { prefix, name } = prefixFromChainId(chainId)
  const endpoint = `https://${prefix}.gateway.pokt.network/v1/${appId}`

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
  const numberProps = useSpring({
    number: Math.min(successRate * 100, 100),
    from: { number: 0 },
  })
  const [primarySuccessColor, secondarySuccessColor] = useSuccessRateColor(
    successRate
  )
  const numberIndicatorProps = useSpring({ height: 4, from: { height: 0 } })
  const successRateDelta = useMemo(
    () => (((successRate - previousSuccessRate) / 1) * 100).toFixed(2),
    [previousSuccessRate, successRate]
  )

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
          background: ${primarySuccessColor};
          height: ${12 * GU}px;
          border-radius: ${1 * GU}px ${1 * GU}px 0 0;
          display: flex;
          justify-content: center;
          align-items: center;
        `}
      >
        <animated.h2
          css={`
            ${textStyle('title1')}
            font-size: ${6 * GU}px;
          `}
        >
          {numberProps.number.interpolate((x) => `${x.toFixed(2)}%`)}
        </animated.h2>
        <animated.div
          css={`
            position: absolute;
            bottom: 0;
            width: 100%;
            background: ${secondarySuccessColor};
          `}
          style={numberIndicatorProps}
        />
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
                  font-weight: 700;
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
              Last 7 days
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
              ${textStyle('title3')}
            `}
          >
            {Intl.NumberFormat().format(totalRequests)}
          </h4>
        </div>
      </div>

      <ButtonBase
        css={`
          bottom: 0;
          left: 0;
          width: 100%;
          height: ${5 * GU}px;
          border-top: 2px solid #31a1d2;
          border-radius: 0 0 ${RADIUS}px ${RADIUS}px;
          color: #31a1d2;
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
          color={() => theme.accent}
          scales={chartScales}
        />
      </div>
    </Box>
  )
}

function UsageTrends({ chartLabels, chartLines, sessionRelays }) {
  const usageColor = useUsageColor(sessionRelays / MAX_RELAYS_PER_SESSION)
  const theme = useTheme()

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
        `}
      >
        <div
          css={`
            display: flex;
            flex-direction: column;
            align-items: center;
            grid-column: 1;
            border-right: 1px solid ${theme.background};
          `}
        >
          <h3
            css={`
              ${textStyle('title2')}
            `}
          >
            Current usage
          </h3>
          <Spacer size={2 * GU} />
          <CircleGraph
            value={Math.min(1, sessionRelays / MAX_RELAYS_PER_SESSION)}
            size={125}
            color={usageColor}
          />
          <Spacer size={2 * GU} />
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
                ${textStyle('body3')}
                font-weight: 700;
              `}
            >
              Relays this session
            </span>
          </h4>
        </div>
        <div
          css={`
            grid-column: 2;
          `}
        >
          <h3
            css={`
              ${textStyle('title2')}
              text-align: right;
            `}
          >
            Weekly usage
          </h3>
          <LineChart
            lines={chartLines}
            label={(i) => chartLabels[i]}
            height={300}
            color={() => '#31A1D2'}
            renderCheckpoints
            dotRadius={GU / 1.5}
            threshold
            scales={[
              { label: '0' },
              { label: '250K' },
              { label: '500K' },
              { label: '750K' },
              { label: '1M', highlightColor: theme.negative },
              '',
            ]}
          />
        </div>
      </div>
    </Box>
  )
}

function LatestRequests({ publicKey = env('TEST_APP_PUB_KEY') }) {
  const [page, setPage] = useState(0)
  const { within } = useViewport()
  const { isLatestRelaysLoading, latestRelayData } = useLatestRelays(
    publicKey,
    page
  )

  const onPageChange = useCallback((page) => setPage(page), [])
  const [colorsByMethod, countByColor, colorValues] = useMemo(() => {
    if (isLatestRelaysLoading) {
      return []
    }
    const { latestRelays: latestRequests = [] } = latestRelayData
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
    return latestRelayData ? latestRelayData.latestRelays : []
  }, [latestRelayData])

  return (
    <Box
      title="Latest requests"
      css={`
        padding-bottom: ${4 * GU}px;
      `}
    >
      <div
        css={`
          display: grid;
          grid-template-columns: ${4 * GU}px 1fr;
        `}
      >
        <div
          css={`
            width: ${1 * GU}px;
            height: 100%;
            overflow-y: hidden;
          `}
        >
          {colorValues?.map((val, i) => {
            return (
              <div
                key={i}
                css={`
                  background: ${val};
                  width: 100%;
                  height: ${(countByColor.get(val) / PER_PAGE) * 100}%;
                  box-shadow: ${val} 0px 2px 8px 0px;
                `}
              />
            )
          })}
        </div>
        <DataView
          mode={compactMode ? 'list' : 'table'}
          fields={[
            'Request Type',
            'Data transferred',
            'Result',
            'Time Elapsed',
          ]}
          entries={latestRelays}
          status={isLatestRelaysLoading ? 'loading' : 'default'}
          renderEntry={({
            bytes,
            method,
            result,
            elapsed_time: elapsedTime,
          }) => {
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
      </div>
    </Box>
  )
}

function AppDetails({ id, pubkey, secret }) {
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
          App public key
        </h3>
        <TextCopy
          value={pubkey}
          onCopy={() => toast('App public key copied to clipboard')}
        />
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