import {
  fillAppPool,
  stakeAppPool,
  unstakeAvailableApps,
} from "workers/application";
import { getNetworkStatsCount, getNodeCountForChains } from "workers/network";
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
    workerFn: (ctx) => fillAppPool(ctx),
    recurrence: ONE_MINUTES,
  },
  {
    name: "App pool staker",
    color: "green",
    workerFn: (ctx) => stakeAppPool(ctx),
    recurrence: FIVE_MINUTES,
  },
  {
    name: "App decomissioner",
    color: "green",
    workerFn: (ctx) => unstakeAvailableApps(ctx),
    recurrence: FIFTEEN_MINUTES,
  },
  {
    name: "Network stats counter",
    color: "yellow",
    workerFn: (ctx) => getNetworkStatsCount(ctx),
    recurrence: SIXTY_MINUTES,
  },
  {
    name: "Nodes per chain counter",
    color: "yellow",
    workerFn: (ctx) => getNodeCountForChains(ctx),
    recurrence: SIXTY_MINUTES,
  },
];
