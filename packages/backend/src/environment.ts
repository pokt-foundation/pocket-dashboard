import * as dotenv from 'dotenv'
dotenv.config()

export type AuthKeys = {
  publicSecret: string
  privateSecret: string
  secretKey: string
  expiration: string
  refreshExpiration: string
}

export type PersistenceKeys = {
  url: string
  dbUser: string
  dbPassword: string
  dbName: string
  dbEncryptionKey: string
}

export type PocketNetworkKeys = {
  aatVersion: string
  blockTime: string
  chainId: string
  clientPubKey: string
  transactionFee: string
  maxDispatchers: string
  requestTimeout: string
  maxSessions: string
  freeTierFundAccount: string
  freeTierFundAddress: string
  freeTierClientPubKey: string
  dispatchers: string
  chainHash: string
  providerType: string
  httpProviderNode: string
  mainFundAccount: string
  mainFundAddress: string
}

export const ENV_VARS = {
  prod(): boolean {
    return process.env.NODE_ENV === 'production'
  },
  FRONTEND_URL(): string {
    return process.env.FRONTEND_URL || 'http://localhost:3000'
  },
  ALLOWED_DOMAINS(): string[] {
    return process.env.ALLOWED_DOMAINS?.split(',') ?? ['http://localhost:3000']
  },
  ENABLE_WORKERS(): boolean {
    return Boolean(process.env.ENABLE_WORKERS) || false
  },
  HASURA_SECRET(): string {
    return process.env.HASURA_ADMIN_SECRET || ''
  },
  HASURA_URL(): string {
    return process.env.HASURA_URL?.trim() ?? ''
  },
  AUTH(): AuthKeys {
    return {
      publicSecret: process.env.JWT_PUBLIC_SECRET?.replace(/\\n/gm, '\n') ?? '',
      privateSecret:
        process.env.JWT_PRIVATE_SECRET?.replace(/\\n/gm, '\n') ?? '',
      secretKey: process.env.JWT_SECRET_KEY,
      expiration: process.env.JWT_EXPIRATION,
      refreshExpiration: process.env.JWT_REFRESH_EXPIRATION,
    }
  },
  EMAIL_API_KEY(): string {
    return process.env.EMAIL_API_KEY?.trim() ?? ''
  },
  EMAIL_FROM(): string {
    return process.env.EMAIL_FROM
  },
  // TODO: Refactor to have better names
  PERSISTENCE(): PersistenceKeys {
    return {
      url: process.env.DATABASE_URL,
      dbUser: process.env.DATABASE_USER,
      dbPassword: process.env.DATABASE_PASSWORD,
      dbName: process.env.DATABASE_NAME,
      dbEncryptionKey: process.env.DATABASE_ENCRYPTION_KEY,
    }
  },
  POCKET_NETWORK(): PocketNetworkKeys {
    return {
      aatVersion: process.env.POCKET_NETWORK_AAT_VERSION,
      blockTime: process.env.POCKET_NETWORK_BLOCK_TIME,
      transactionFee: process.env.POCKET_NETWORK_TRANSACTION_FEE,
      chainId: process.env.POCKET_NETWORK_CHAIN_ID,
      maxDispatchers: process.env.POCKET_NETWORK_MAX_DISPATCHER,
      requestTimeout: process.env.POCKET_NETWORK_REQUEST_TIMEOUT,
      maxSessions: process.env.POCKET_NETWORK_MAX_SESSIONS,
      freeTierFundAccount: process.env.POCKET_NETWORK_FREE_TIER_FUND_ACCOUNT,
      freeTierFundAddress: process.env.POCKET_NETWORK_FREE_TIER_FUND_ADDRESS,
      freeTierClientPubKey: process.env.POCKET_NETWORK_CLIENT_PUB_KEY,
      dispatchers: process.env.POCKET_NETWORK_DISPATCHERS,
      chainHash: process.env.POCKET_NETWORK_CHAIN_HASH,
      providerType: process.env.POCKET_NETWORK_PROVIDER_TYPE,
      httpProviderNode: process.env.POCKET_NETWORK_HTTP_PROVIDER_NODE,
      mainFundAccount: process.env.POCKET_NETWORK_MAIN_FUND_ACCOUNT,
      mainFundAddress: process.env.POCKET_NETWORK_MAIN_FUND_ADDRESS,
      clientPubKey: process.env.POCKET_NETWORK_CLIENT_PUB_KEY,

      // aat_version: process.env.POCKET_NETWORK_AAT_VERSION,
      // transaction_fee: process.env.POCKET_NETWORK_TRANSACTION_FEE,
      // chain_id: process.env.POCKET_NETWORK_CHAIN_ID,
      // max_dispatchers: process.env.POCKET_NETWORK_MAX_DISPATCHER,
      // request_timeout: process.env.POCKET_NETWORK_REQUEST_TIMEOUT,
      // max_sessions: process.env.POCKET_NETWORK_MAX_SESSIONS,
      // free_tier: {
      // stake_amount: process.env.POCKET_FREE_TIER_STAKE_AMOUNT,
      // max_relay_per_day_amount:
      // process.env.POCKET_FREE_TIER_MAX_RELAY_PER_DAY_AMOUNT,
      // fund_account: process.env.POCKET_NETWORK_FREE_TIER_FUND_ACCOUNT,
      // fund_address: process.env.POCKET_NETWORK_FREE_TIER_FUND_ADDRESS,
      // client_pub_key: process.env.POCKET_NETWORK_CLIENT_PUB_KEY,
      // },
      // dispatchers: process.env.POCKET_NETWORK_DISPATCHERS,
      // chain_hash: process.env.POCKET_NETWORK_CHAIN_HASH,
      // provider_type: process.env.POCKET_NETWORK_PROVIDER_TYPE,
      // http_provider_node: process.env.POCKET_NETWORK_HTTP_PROVIDER_NODE,
      // main_fund_account: process.env.POCKET_NETWORK_MAIN_FUND_ACCOUNT,
      // main_fund_address: process.env.POCKET_NETWORK_MAIN_FUND_ADDRESS,
    }
  },
}

type envVarCategory =
  | 'prod'
  | 'POCKET_NETWORK'
  | 'PERSISTENCE'
  | 'FRONTEND_URL'
  | 'ALLOWED_DOMAINS'
  | 'ENABLE_WORKERS'
  | 'HASURA_SECRET'
  | 'HASURA_URL'
  | 'AUTH'
  | 'EMAIL_API_KEY'
  | 'EMAIL_FROM'

/**
 * Returns the corresponding object for the named passed
 *
 * @param {string} name name of the environment block
 *
 * @returns {object} object with scoped environment variables
 *
 */
export default function env(
  name: envVarCategory
): string | boolean | AuthKeys | PersistenceKeys | PocketNetworkKeys {
  // @ts-ignore
  return ENV_VARS[name]()
}
