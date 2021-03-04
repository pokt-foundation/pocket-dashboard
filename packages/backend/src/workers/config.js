import {
  fillAppPool,
  stakeAppPool,
  unstakeAvailableApps,
} from "workers/application";
import {
  getTotalNodeCount,
  getTotalAppCount,
  getTotalPoktStaked,
  getNodeCountForChains,
} from "workers/network";
import {
  ONE_MINUTES,
  FIVE_MINUTES,
  FIFTEEN_MINUTES,
  SIXTY_MINUTES,
} from "workers/utils";

/**
 * Holds the workers configuration.
 *
 * each type (category) of worker is color coded:
 * app-related workers (staking, unstaking, notifications) are colored green
 * network-related workers (counters) are colored yellow
 * misc workers are colored cyan
 */
export const WORKERS = [
  {
    name: "App pool filler",
    color: "green",
    workerFn: fillAppPool,
    recurrence: ONE_MINUTES,
  },
  {
    name: "App pool staker",
    color: "green",
    workerFn: stakeAppPool,
    recurrence: FIVE_MINUTES,
  },
  {
    name: "App decomissioner",
    color: "green",
    workerFn: unstakeAvailableApps,
    recurrence: FIFTEEN_MINUTES,
  },
  {
    name: "Global node counter",
    color: "yellow",
    workerFn: getTotalNodeCount,
    recurrence: SIXTY_MINUTES,
  },
  {
    name: "Global app counter",
    color: "yellow",
    workerFn: getTotalAppCount,
    recurrence: SIXTY_MINUTES,
  },
  {
    name: "Global pokt staked counter",
    color: "yellow",
    workerFn: getTotalPoktStaked,
    recurrence: SIXTY_MINUTES,
  },
  {
    name: "Nodes per chain counter",
    color: "yellow",
    workerFn: getNodeCountForChains,
    recurrence: SIXTY_MINUTES,
  },
];
