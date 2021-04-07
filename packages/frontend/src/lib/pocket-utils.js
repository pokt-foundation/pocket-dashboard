export const STAKING_STATUSES = {
  Unstaked: 0,
  Unstaking: 1,
  Staked: 2,
};

const STAKING_STATUSES_LABELS = {
  0: "Unstaked",
  1: "Unstaking",
  2: "Staked",
};

const ONE_MILLION_RELAYS_STAKE = 24950100000;
const ONE_HUNDRED_THOUSAND_RELAYS_STAKE = 2495010000;

const THRESHOLDS_PER_STAKE = new Map([
  [
    ONE_MILLION_RELAYS_STAKE,
    {
      maxRelays: 1000000,
      graphThreshold: 1500000,
      legibleMaxRelays: "1M",
    },
  ],
  [
    ONE_HUNDRED_THOUSAND_RELAYS_STAKE,
    {
      maxRelays: 100000,
      graphThreshold: 150000,
      legibleMaxRelays: "100K",
    },
  ],
]);

export function getStakingStatus(status) {
  return STAKING_STATUSES_LABELS[status];
}

export function getThresholdsPerStake(stake) {
  console.log(stake);

  if (!THRESHOLDS_PER_STAKE.has(stake)) {
    throw new Error("Unknown stake");
  }

  return THRESHOLDS_PER_STAKE.get(stake);
}
