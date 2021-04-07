const CHAIN_ID_PREFIXES = new Map([
  ["0001", "mainnet"],
  ["0002", "btc-mainnet"],
  ["0003", "ava-mainnet"],
  ["0004", "bsc-mainnet"],
  ["0005", "fuse-mainnet"],
  ["0006", "solana-mainnet"],
  ["0021", "eth-mainnet"],
  ["0022", "eth-archival"],
  ["0023", "eth-ropsten"],
  ["0024", "poa-kovan"],
  ["0025", "eth-rinkeby"],
  ["0026", "eth-goerli"],
  ["0027", "poa-xdai"],
]);

export function prefixFromChainId(chainId) {
  return CHAIN_ID_PREFIXES.get(chainId);
}
