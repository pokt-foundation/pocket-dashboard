import React, { useMemo } from 'react'
import { format } from 'd3-format'
import { useViewport } from 'use-viewport'
import 'styled-components/macro'
import {
  CircleGraph,
  DataView,
  LineChart,
  Spacer,
  Split,
  textStyle,
  useTheme,
  GU,
} from 'ui'
import AnimatedLogo from 'components/AnimatedLogo/AnimatedLogo'
import Box from 'components/Box/Box'
import FloatUp from 'components/FloatUp/FloatUp'
import {
  useNetworkSuccessRate,
  useTotalWeeklyRelays,
  useNetworkSummary,
  useChains,
} from 'views/Dashboard/Network/network-hooks'
import { norm } from 'lib/math-utils'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PER_PAGE = 5

function formatDailyRelaysForGraphing(dailyRelays) {
  const labels = dailyRelays
    .map(({ bucket }) => bucket.split('T')[0])
    .map((bucket) => DAYS[new Date(bucket).getUTCDay()])

  const highestDailyAmount = dailyRelays.reduce(
    (highest, { total_relays: totalRelays }) => Math.max(highest, totalRelays),
    0
  )

  const lines = [
    {
      id: 1,
      values: dailyRelays.map(({ total_relays: totalRelays }) =>
        norm(totalRelays, 0, highestDailyAmount)
      ),
    },
  ]

  const formatSi = format('.2s')

  const scales = [
    { label: 0 },
    { label: formatSi((highestDailyAmount * 0.25).toFixed(0)) },
    { label: formatSi((highestDailyAmount * 0.5).toFixed(0)) },
    { label: formatSi((highestDailyAmount * 0.75).toFixed(0)) },
    { label: formatSi(highestDailyAmount.toFixed(0)) },
  ]

  return {
    labels,
    lines,
    scales,
  }
}

export default function NetworkStatus() {
  const { isRelaysError, isRelaysLoading, relayData } = useTotalWeeklyRelays()
  const { isSuccessRateLoading, successRateData } = useNetworkSuccessRate()
  const { isSummaryLoading, summaryData } = useNetworkSummary()
  const { isChainsLoading, chains } = useChains()
  const theme = useTheme()
  const { within } = useViewport()
  const compactMode = within(-1, 'medium')

  const { labels = [], lines = [], scales = [] } = useMemo(
    () =>
      isRelaysLoading || isRelaysError || relayData === undefined
        ? {}
        : formatDailyRelaysForGraphing(relayData.dailyRelays),
    [isRelaysError, isRelaysLoading, relayData]
  )

  const loading = useMemo(
    () =>
      isSuccessRateLoading ||
      isRelaysLoading ||
      isSummaryLoading ||
      isChainsLoading,
    [isChainsLoading, isRelaysLoading, isSuccessRateLoading, isSummaryLoading]
  )

  return loading ? (
    <div
      css={`
        position: relative;
        width: 100%;
        /* TODO: This is leaky. fix up with a permanent component */
        height: 60vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      `}
    >
      <AnimatedLogo />
      <Spacer size={2 * GU} />
      <p
        css={`
          ${textStyle('body2')}
        `}
      >
        Loading network status...
      </p>
    </div>
  ) : (
    <FloatUp
      content={() => (
        <>
          <Split
            primary={
              <>
                <Box>
                  <div
                    css={`
                      display: flex;
                      justify-content: space-between;
                    `}
                  >
                    <h3
                      css={`
                        ${textStyle('title2')}
                      `}
                    >
                      Total Relays
                    </h3>

                    <div
                      css={`
                        text-align: right;
                      `}
                    >
                      <h4
                        css={`
                          ${textStyle('title4')}
                        `}
                      >
                        {Intl.NumberFormat().format(
                          relayData.totalWeeklyRelays
                        )}
                      </h4>
                      <h5>For the past week</h5>
                    </div>
                  </div>
                  <Spacer size={1 * GU} />
                  <LineChart
                    backgroundFill="#1B2331"
                    borderColor={`rgba(0,0,0,0)`}
                    color={() => `#31A1D2`}
                    dotRadius={GU / 1.5}
                    height={240}
                    label={(index) => labels[index]}
                    lines={lines}
                    renderCheckpoints
                    scales={scales}
                  />
                </Box>
                <Spacer size={4 * GU} />
                <Box title="Available Networks">
                  <DataView
                    fields={['Network', 'ID', 'Ticker']}
                    entries={chains}
                    mode={compactMode ? 'list' : 'table'}
                    entriesPerPage={PER_PAGE}
                    renderEntry={({ description, id, network, ticker }) => [
                      <p>{description || network}</p>,
                      <p>{id}</p>,
                      <p>{ticker}</p>,
                    ]}
                  />
                </Box>
              </>
            }
            secondary={
              <>
                <Box title="Network Success Rate">
                  <div
                    css={`
                      display: flex;
                      align-items: flex-end;
                      ${compactMode &&
                      `
                  flex-direction: row;
                  justify-content: space-between;
                `}
                    `}
                  >
                    <CircleGraph
                      size={20 * GU}
                      strokeWidth={GU}
                      value={
                        successRateData.totalSuccessfulWeeklyRelays /
                        relayData.totalWeeklyRelays
                      }
                      color={theme.positive}
                    />
                    <Spacer size={2 * GU} />
                    <div>
                      <p
                        css={`
                          ${textStyle('title3')}
                        `}
                      >
                        {Intl.NumberFormat().format(
                          successRateData.totalSuccessfulWeeklyRelays
                        )}
                      </p>
                      <p
                        css={`
                          ${textStyle('body2')}
                        `}
                      >
                        Sucessful relays
                      </p>
                      <Spacer size={0.5 * GU} />
                      <p
                        css={`
                          ${textStyle('body4')}
                        `}
                      >
                        Last 7 Days Count
                      </p>
                    </div>
                  </div>
                  <Spacer size={1 * GU} />
                </Box>
                <Spacer size={4 * GU} />
                <Box title="Network Summary">
                  <ul
                    css={`
                      list-style: none;
                      height: 100%;
                      li {
                        display: flex;
                        justify-content: space-between;
                      }
                    `}
                  >
                    <li>
                      Apps staked <span>{summaryData.appsStaked} </span>
                    </li>
                    <Spacer size={2 * GU} />
                    <li>
                      Nodes staked <span>{3456}</span>
                    </li>
                    <Spacer size={2 * GU} />
                    <li>
                      POKT staked <span>{242.99}m</span>
                    </li>
                  </ul>
                </Box>
              </>
            }
          />
        </>
      )}
    />
  )
}
