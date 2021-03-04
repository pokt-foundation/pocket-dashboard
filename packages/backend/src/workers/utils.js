const TEST_CHAINS = {
  POCKET_TESTNET: {
    ticker: "POKT",
    id: "0002",
    limit: 3,
  },
  ETHEREUM_ROPSTEN_FULL: {
    ticker: "ETH",
    id: "0023",
    limit: 2,
  },
  ETHEREUM_GOERLI_FULL: {
    ticker: "ETH",
    id: "0020",
    limit: 2,
  },
  ETHEREUM_RINKEBY_FULL: {
    ticker: "ETH",
    id: "0022",
    limit: 3,
  },
};

const MAIN_CHAINS = {
  POCKET_MAINNET: {
    ticker: "POKT",
    id: "0001",
    limit: 3,
  },
  ETHEREUM_KOVAN_FULL: {
    ticker: "POA",
    id: "0024",
    limit: 2,
  },
  ETHEREUM_MAINNET_FULL: {
    ticker: "ETH",
    id: "0021",
    limit: 5,
  },
  ETHEREUM_MAINNET_ARCHIVAL: {
    ticker: "ETH",
    id: "0022",
    limit: 2,
  },
  ETHEREUM_GOERLI_FULL: {
    ticker: "ETH",
    id: "0020",
    limit: 2,
  },
  ETHEREUM_XDAI_FULL: {
    ticker: "POA",
    id: "0027",
    limit: 3,
  },
};

let chains = {};

if (process.env.NODE_ENV === "development") {
  chains = { ...TEST_CHAINS };
}

if (process.env.NODE_ENV === "production") {
  chains = {
    ...TEST_CHAINS,
    ...MAIN_CHAINS,
  };
}

export const CHAINS = chains;

export const ONE_MINUTES = "*/1 * * * *";
export const FIVE_MINUTES = "*/5 * * * *";
export const FIFTEEN_MINUTES = "*/15 * * * *";
export const SIXTY_MINUTES = "0 * * * *";
