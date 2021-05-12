import {
  fillAppPool,
  stakeAppPool,
  unstakeAvailableApps,
} from "@/workers/application";
import { getNetworkStatsCount, getNodeCountForChains } from "@/workers/network";
import { sendUsageNotifications } from "@/workers/notifications";
import {
  ONE_MINUTES,
  FIVE_MINUTES,
  FIFTEEN_MINUTES,
  SIXTY_MINUTES,
} from "@/workers/utils";

const TEST_ONLY_CHAINS = {
  POCKET_TESTNET: {
    ticker: "POKT",
    id: "0002",
    limit: 3,
  },
};

const TEST_CHAINS = {
  ETHEREUM_GOERLI_FULL: {
    ticker: "ETH",
    id: "0026",
    limit: 2,
  },
  ETHEREUM_RINKEBY_FULL: {
    ticker: "ETH",
    id: "0025",
    limit: 3,
  },
  ETHEREUM_ROPSTEN_FULL: {
    ticker: "ETH",
    id: "0023",
    limit: 2,
  },
};

const MAIN_CHAINS = {
  // ETHEREUM_GOERLI_FULL: {
  //   ticker: "ETH",
  //   id: "0026",
  //   limit: 3,
  // },
  // ETHEREUM_KOVAN_FULL: {
  //   ticker: "POA",
  //   id: "0024",
  //   limit: 2,
  // },
  ETHEREUM_MAINNET_ARCHIVAL: {
    ticker: "ETH",
    id: "0022",
    limit: 3,
  },
  FUSE_FULL: {
    ticker: "FUSE",
    id: "0005",
    limit: 1,
  },
  ETHEREUM_MAINNET_FULL: {
    ticker: "ETH",
    id: "0021",
    limit: 10,
  },
  ETHEREUM_RINKEBY_FULL: {
    ticker: "ETH",
    id: "0025",
    limit: 3,
  },
  // ETHEREUM_XDAI_FULL: {
  //   ticker: "POA",
  //   id: "0027",
  //   limit: 3,
  // },
  POCKET_MAINNET: {
    ticker: "POKT",
    id: "0001",
    limit: 1,
  },
};

function getChainsByEnvironment() {
  if (process.env.NODE_ENV === "development") {
    return { ...TEST_CHAINS, ...TEST_ONLY_CHAINS };
  }

  if (process.env.NODE_ENV === "production") {
    return {
      ...MAIN_CHAINS,
    };
  }
}

export const FREE_TIER_STAKE_AMOUNT = 24950100000n;
export const chains = getChainsByEnvironment();

/**
 * Holds the workers configuration.
 *
 * each type (category) of worker is color coded:
 * app-related workers (staking, unstaking, notifications) are colored green
 * network-related workers (counters) are colored yellow
 * misc workers are colored cyan
 */
export const workers = [
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
  {
    name: "Usage notification service",
    color: "blue",
    workerFn: (ctx) => sendUsageNotifications(ctx),
    recurrence: FIFTEEN_MINUTES,
  },
];
