import env from '../environment'

export const STAKING_STATUSES = {
  Unstaked: 0,
  Unstaking: 1,
  Staked: 2,
}

const STAKING_STATUSES_LABELS = {
  0: 'Unstaked',
  1: 'Unstaking',
  2: 'Staked',
}

const TWO_MILLION_RELAYS_STAKE = 50000000000
const ONE_MILLION_RELAYS_STAKE = 24950100000
const ONE_MILLION_FLAT_RELAYS_STAKE = 25000000000
const ONE_HUNDRED_THOUSAND_RELAYS_STAKE = 2495010000

const THRESHOLDS_PER_STAKE = new Map([
  [
    ONE_MILLION_RELAYS_STAKE,
    {
      maxRelays: 1000000,
      graphThreshold: 1250000,
      legibleMaxRelays: '1M',
    },
  ],
  [
    ONE_MILLION_FLAT_RELAYS_STAKE,
    {
      maxRelays: 1000000,
      graphThreshold: 1250000,
      legibleMaxRelays: '1M',
    },
  ],
  [
    ONE_HUNDRED_THOUSAND_RELAYS_STAKE,
    {
      maxRelays: 100000,
      graphThreshold: 150000,
      legibleMaxRelays: '100K',
    },
  ],
  [
    TWO_MILLION_RELAYS_STAKE,
    {
      maxRelays: 2000000,
      graphThreshold: 2500000,
      legibleMaxRelays: '2M',
    },
  ],
])

export function getStakingStatus(status) {
  return STAKING_STATUSES_LABELS[status]
}

export function getThresholdsPerStake(stake) {
  if (env('USE_TEST_APP')) {
    return THRESHOLDS_PER_STAKE.get(ONE_MILLION_RELAYS_STAKE)
  }
  if (!THRESHOLDS_PER_STAKE.has(stake)) {
    throw new Error('Unknown stake')
  }

  return THRESHOLDS_PER_STAKE.get(stake)
}

/**
 * Shorten a Pocket address, `charsLength` allows to change the number of
 * characters on both sides of the ellipsis.
 *
 * Examples:
 *   shortenAddress('D19731977931271')    // D1973…1271
 *   shortenAddress('A19731977931271', 2) // A1…71
 *   shortenAddress('F197319')            // F197319 (already short enough)
 *
 * @param {string} address The address to shorten
 * @param {number} [charsLength=4] The number of characters to change on both sides of the ellipsis
 * @returns {string} The shortened address
 */
export function shortenAddress(address, charsLength = 4) {
  const prefixLength = 2 // "0x"

  if (!address) {
    return ''
  }
  if (address.length < charsLength * 2 + prefixLength) {
    return address
  }
  return (
    address.slice(0, charsLength + prefixLength) +
    '…' +
    address.slice(-charsLength)
  )
}
