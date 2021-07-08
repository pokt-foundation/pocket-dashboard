const CHAIN_ID_PREFIXES = new Map([
  ['0001', { prefix: 'mainnet', name: 'Pocket Mainnet' }],
  ['0002', { prefix: 'btc-mainnet', name: 'Bitcoin Mainnet' }],
  ['0003', { prefix: 'avax-mainnet', name: 'Avalanche Mainnet' }],
  ['0004', { prefix: 'bsc-mainnet', name: 'Binance Smart Chain Mainnet' }],
  ['0005', { prefix: 'fuse-mainnet', name: 'Fuse Mainnet' }],
  ['0006', { prefix: 'solana-mainnet', name: 'Solana Mainnet' }],
  ['0009', { prefix: 'poly-mainnet', name: 'Polygon (Matic)' }],
  [('0021', { prefix: 'eth-mainnet', name: 'Ethereum Mainnet' })],
  ['0022', { prefix: 'eth-archival', name: 'Ethereum Mainnet (Archival)' }],
  ['0023', { prefix: 'eth-ropsten', name: 'Ethereum Ropsten' }],
  ['0024', { prefix: 'poa-kovan', name: 'Kovan' }],
  ['0025', { prefix: 'eth-rinkeby', name: 'Ethereum Rinkeby' }],
  ['0026', { prefix: 'eth-goerli', name: 'Ethereum Goerli' }],
  ['0027', { prefix: 'poa-xdai', name: 'XDAI Mainnet' }],
])

export function prefixFromChainId(chainId) {
  return CHAIN_ID_PREFIXES.get(chainId)
}
