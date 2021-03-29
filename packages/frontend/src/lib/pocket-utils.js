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

export function getStakingStatus(status) {
  return STAKING_STATUSES_LABELS[status];
}
