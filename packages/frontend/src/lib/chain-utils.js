const CHAIN_ID_PREFIXES = new Map([
  ["0002", "testnet"],
  ["0020", "eth-goerli"],
  ["0021", "eth-mainnet"],
  ["0022", "eth-rinkeby"],
  ["0023", "eth-ropsten"],
]);

export function prefixFromChainId(chainId) {
  if (!CHAIN_ID_PREFIXES.has(chainId)) {
    throw new Error("chain id does not have prefix");
  }

  return CHAIN_ID_PREFIXES.get(chainId);
}
