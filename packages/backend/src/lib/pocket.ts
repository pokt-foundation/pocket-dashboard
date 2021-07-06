/* global BigInt */
import {
  Application,
  Configuration,
  HttpRpcProvider,
  Node,
  ITransactionSender,
  Pocket,
  PocketRpcProvider,
  QueryAccountResponse,
  QueryAppResponse,
  QueryBalanceResponse,
  QueryTXResponse,
  RpcError,
  typeGuard,
  UnlockedAccount,
  RawTxRequest,
} from '@pokt-network/pocket-js'
import env, { PocketNetworkKeys } from '../environment'

const {
  blockTime,
  chainId,
  freeTierFundAccount,
  freeTierFundAddress,
  transactionFee,
} = env('POCKET_NETWORK') as PocketNetworkKeys

const DEFAULT_DISPATCHER_LIST = 'https://mainnet-1.nodes.pokt.network:4201,https://mainnet-2.nodes.pokt.network:4202,https://mainnet-3.nodes.pokt.network:4203,https://mainnet-4.nodes.pokt.network:4204,https://mainnet-5.nodes.pokt.network:4205,https://mainnet-6.nodes.pokt.network:4206,https://mainnet-7.nodes.pokt.network:4207,https://mainnet-8.nodes.pokt.network:4208,https://mainnet-9.nodes.pokt.network:4209,https://mainnet-10.nodes.pokt.network:4210,https://mainnet-11.nodes.pokt.network:4211,https://mainnet-12.nodes.pokt.network:4212,https://mainnet-13.nodes.pokt.network:4213,https://mainnet-14.nodes.pokt.network:4214,https://mainnet-15.nodes.pokt.network:4215,https://mainnet-16.nodes.pokt.network:4216,https://mainnet-17.nodes.pokt.network:4217,https://mainnet-18.nodes.pokt.network:4218,https://mainnet-19.nodes.pokt.network:4219,https://mainnet-20.nodes.pokt.network:4220,https://mainnet-21.nodes.pokt.network:4221,https://mainnet-22.nodes.pokt.network:4222,https://mainnet-23.nodes.pokt.network:4223,https://mainnet-24.nodes.pokt.network:4224'
  .split(',')
  .map((uri) => new URL(uri))
const DEFAULT_HTTP_PROVIDER_NODE = 'https://mainnet-1.nodes.pokt.network:4201/'
const DEFAULT_MAX_DISPATCHERS = 24
const DEFAULT_MAX_SESSIONS = 1000000
const DEFAULT_MAX_SESSION_RETRIES = 1
const DEFAULT_REQUEST_TIMEOUT = 60 * 1000

const POCKET_CONFIGURATION = new Configuration(
  DEFAULT_MAX_DISPATCHERS,
  DEFAULT_MAX_SESSIONS,
  0,
  DEFAULT_REQUEST_TIMEOUT,
  false,
  undefined,
  Number(blockTime),
  DEFAULT_MAX_SESSION_RETRIES,
  false,
  false,
  false
)

export const POKT_DENOMINATIONS = {
  pokt: 0,
  upokt: 6,
}

function getPocketDispatchers() {
  return DEFAULT_DISPATCHER_LIST
}

function getRPCProvider(): HttpRpcProvider | PocketRpcProvider {
  return new HttpRpcProvider(new URL(DEFAULT_HTTP_PROVIDER_NODE))
}

export async function getNodes(status: number): Promise<Node[]> {
  let page = 1
  const nodeList = []
  const perPage = 100
  const pocketRpcProvider = getRPCProvider()
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const nodesResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getNodes(status, undefined, BigInt(0), undefined, page, perPage)

  if (nodesResponse instanceof RpcError) {
    return []
  }
  const totalPages = nodesResponse.totalPages

  nodesResponse.nodes.forEach((node) => {
    nodeList.push(node)
  })
  page++
  while (page <= totalPages) {
    const response = await pocketInstance
      .rpc(pocketRpcProvider)
      .query.getNodes(status, undefined, BigInt(0), undefined, page, perPage)

    // Increment page variable
    page++
    if (response instanceof RpcError) {
      page = totalPages
      return
    }
    response.nodes.forEach((node) => {
      nodeList.push(node)
    })
  }
  return nodesResponse.nodes
}

export async function getApplications(status: number): Promise<Application[]> {
  let page = 1
  const applicationList = []
  const pocketRpcProvider = getRPCProvider()
  const perPage = 100
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const applicationsResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getApps(status, BigInt(0), undefined, page, perPage)

  if (applicationsResponse instanceof RpcError) {
    return []
  }
  const totalPages = applicationsResponse.totalPages

  while (page <= totalPages) {
    const response = await pocketInstance
      .rpc(pocketRpcProvider)
      .query.getApps(status, BigInt(0), undefined, page, perPage)

    page++
    if (response instanceof RpcError) {
      page = totalPages
      return
    }
    response.applications.forEach((app) => {
      applicationList.push(app)
    })
  }
  return applicationList
}

export async function transferFromFreeTierFund(
  amount: string,
  customerAddress: string
): Promise<string> {
  if (!transactionFee) {
    throw new Error("Can't transfer from free tier: transaction fee missing")
  }
  if (!chainId) {
    throw new Error("Can't transfer from free tier: chainID missing")
  }
  if (!amount) {
    throw new Error("Can't transfer from free tier: no amount provided")
  }
  if (!customerAddress) {
    throw new Error(
      "Can't transfer from free tier: no customer address provided"
    )
  }
  const totalAmount = BigInt(Number(amount) + Number(transactionFee))

  if (!totalAmount) {
    throw "Can't transfer from free tier: failed to calculate totalAmount"
  }
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const pocketRpcProvider = getRPCProvider()

  pocketInstance.rpc(pocketRpcProvider)
  const rawTxResponse = await (pocketInstance.withPrivateKey(
    freeTierFundAccount
  ) as ITransactionSender)
    .send(freeTierFundAddress, customerAddress, totalAmount.toString())
    .submit(chainId, transactionFee)

  console.log('rawTxResponse', rawTxResponse)
  if (typeGuard(rawTxResponse, RpcError)) {
    throw new Error(rawTxResponse.message)
  }
  console.log(rawTxResponse.hash, 'done')
  return rawTxResponse.hash
}

export async function createUnlockedAccount(
  passphrase: string
): Promise<UnlockedAccount> {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const account = await pocketInstance.keybase.createAccount(passphrase)
  const unlockedAccountOrError = await pocketInstance.keybase.getUnlockedAccount(
    (account as UnlockedAccount & Error).addressHex,
    passphrase
  )

  if (typeGuard(unlockedAccountOrError, Error)) {
    throw new Error(unlockedAccountOrError.message)
  } else if (typeGuard(unlockedAccountOrError, UnlockedAccount)) {
    return unlockedAccountOrError
  } else {
    throw new Error('Unknown error while creating an unlocked account')
  }
}

export async function getBalance(
  addressHex: string
): Promise<QueryBalanceResponse | RpcError> {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const pocketRpcProvider = getRPCProvider()
  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getBalance(addressHex)

  console.log(applicationResponse, 'app response for', addressHex)
  return applicationResponse
}

export async function getTX(
  addressHex: string
): Promise<Error | QueryTXResponse> {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const pocketRpcProvider = getRPCProvider()
  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getTX(addressHex)

  return applicationResponse
}

export async function getAccount(
  addressHex: string
): Promise<RpcError | QueryAccountResponse> {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const pocketRpcProvider = getRPCProvider()
  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getAccount(addressHex)

  return applicationResponse
}

export async function getApp(
  addressHex: string
): Promise<RpcError | QueryAppResponse> {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const pocketRpcProvider = getRPCProvider()
  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getApp(addressHex)

  return applicationResponse
}

export async function createAppStakeTx(
  passphrase: string,
  privateKey: Buffer,
  chains: string[],
  stakeAmount: string
): Promise<RpcError | RawTxRequest> {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const unlockedAccount = await pocketInstance.keybase.importAccount(
    privateKey,
    passphrase
  )

  if (unlockedAccount instanceof Error) {
    throw unlockedAccount
  }
  const senderAccount = await pocketInstance.withImportedAccount(
    unlockedAccount.addressHex,
    passphrase
  )

  // @ts-ignore
  const { unlockedAccount: account } = senderAccount

  return await (senderAccount as ITransactionSender)
    .appStake(account.publicKey.toString('hex'), chains, stakeAmount.toString())
    .createTransaction(chainId, transactionFee)
}

export async function getPocketInstance(): Promise<Pocket> {
  return new Pocket(getPocketDispatchers(), undefined, POCKET_CONFIGURATION)
}

export async function submitRawTransaction(
  fromAddress: string,
  rawTxBytes: string
): Promise<string> {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  )
  const pocketRpcProvider = getRPCProvider()
  const rawTxResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .client.rawtx(fromAddress, rawTxBytes)

  console.log('raw tx response stake', rawTxResponse)
  if (typeGuard(rawTxResponse, RpcError)) {
    throw new Error(rawTxResponse.message)
  }
  return rawTxResponse.hash
}
