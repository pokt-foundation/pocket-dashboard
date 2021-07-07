import crypto from 'crypto'
import {
  PocketAAT,
  QueryAppResponse,
  QueryBalanceResponse,
  RawTxRequest,
  typeGuard,
} from '@pokt-network/pocket-js'
import Application from '../models/Application'
import PreStakedApp, { IPreStakedApp } from '../models/PreStakedApp'
import { chains, FREE_TIER_STAKE_AMOUNT } from './config'
import {
  createAppStakeTx,
  createUnlockedAccount,
  getApp,
  getBalance,
  submitRawTransaction,
  transferFromFreeTierFund,
} from '../lib/pocket'
import { APPLICATION_STATUSES } from '../application-statuses'
import env, { PocketNetworkKeys } from '../environment'

const MAX_POOL_SIZE = 1607

type AppWorkerParams = {
  app: IPreStakedApp
  chain: string
  ctx: any
}

async function createApplicationAndFund({
  ctx,
}: AppWorkerParams): Promise<void> {
  const { clientPubKey, aatVersion } = env(
    'POCKET_NETWORK'
  ) as PocketNetworkKeys

  const passphrase = crypto.randomBytes(16).toString('hex')
  const freeTierAccount = await createUnlockedAccount(passphrase)

  const gatewayAat = await PocketAAT.from(
    aatVersion,
    clientPubKey,
    freeTierAccount.publicKey.toString('hex'),
    freeTierAccount.privateKey.toString('hex')
  )

  const newAppForPool: IPreStakedApp = new PreStakedApp({
    status: APPLICATION_STATUSES.AWAITING_FUNDS,
    freeTierApplicationAccount: {
      address: freeTierAccount.addressHex,
      publicKey: freeTierAccount.publicKey.toString('hex'),
      // @ts-ignore
      privateKey: Application.encryptPrivateKey(
        freeTierAccount.privateKey.toString('hex')
      ),
      passPhrase: passphrase,
    },
    gatewayAAT: {
      version: gatewayAat.version,
      clientPublicKey: gatewayAat.clientPublicKey,
      applicationPublicKey: gatewayAat.applicationPublicKey,
      applicationSignature: gatewayAat.applicationSignature,
    },
    createdAt: new Date(Date.now()),
  })

  const txHash = await transferFromFreeTierFund(
    FREE_TIER_STAKE_AMOUNT.toString(),
    freeTierAccount.addressHex
  )

  if (!txHash) {
    ctx.logger.warn(
      `Funds were not sent for app ${newAppForPool.freeTierApplicationAccount.address}! This is an issue with connecting to the network with PocketJS.`
    )
  }

  newAppForPool.status = APPLICATION_STATUSES.AWAITING_STAKING
  newAppForPool.fundingTxHash = txHash

  ctx.logger.log(
    `fillAppPool(): created app with addr ${freeTierAccount.addressHex}`
  )
  ctx.logger.log(
    `fillAppPool(): sent funds to account ${freeTierAccount.addressHex} on tx ${txHash}`
  )
  await newAppForPool.save()
}

async function stakeApplication({
  app,
  chain = '0021',
  ctx,
}: {
  app: IPreStakedApp
  chain: string
  ctx: any
}): Promise<boolean> {
  const { address, passPhrase, privateKey } = app.freeTierApplicationAccount
  const { balance } = (await getBalance(address)) as QueryBalanceResponse
  const onChainApp = await getApp(address)

  if (
    balance < FREE_TIER_STAKE_AMOUNT &&
    typeGuard(onChainApp, QueryAppResponse)
  ) {
    ctx.logger.warn(`app ${address} already exists ${chain}`)
    app.status = APPLICATION_STATUSES.READY
    app.chain = ((onChainApp as unknown) as QueryAppResponse).toJSON().chains[0]
    await app.save()
    return
  }

  if (balance < FREE_TIER_STAKE_AMOUNT) {
    ctx.logger.warn(
      `NOTICE! app ${app.freeTierApplicationAccount.address} doesn't have enough funds.`
    )
    return
  }

  ctx.logger.log(`Staking app ${address} for chain ${chain}`)

  // @ts-ignore
  const decryptedPrivateKey = Application.decryptPrivateKey(privateKey)

  const stakeTxToSend = await createAppStakeTx(
    passPhrase,
    Buffer.from(decryptedPrivateKey, 'hex'),
    [chain],
    FREE_TIER_STAKE_AMOUNT.toString()
  )
  const txHash = await submitRawTransaction(
    address,
    (stakeTxToSend as RawTxRequest).txHex
  )

  app.status = APPLICATION_STATUSES.READY
  app.stakingTxHash = txHash
  app.chain = chain
  await app.save()

  ctx.logger.log(
    `Sent stake request on tx ${txHash} : app ${address}, chain ${chain}`
  )

  return true
}

async function getApplicationAndFund({ chain }: { chain: string }) {
  // Get one "READY" app
}

export async function fillAppPool(ctx): Promise<void> {
  const appPool = await PreStakedApp.find({
    status: APPLICATION_STATUSES.SWAPPABLE,
  })

  for (const [, { id, limit }] of Object.entries(chains)) {
    const availableApps = appPool.filter((app) => app?.chain === id)

    if (availableApps.length < limit) {
      const slotsToFill = limit - availableApps.length

      ctx.logger.log(
        `Filling ${slotsToFill} (out of ${limit}) slots for chain ${id}`
      )

      for (let i = 0; i < slotsToFill; i++) {
        await getApplicationAndFund({ chain: id })
      }
    }
  }

  const slotsAvailable = totalPoolSize - (appPool?.length ?? 0)
  // limit apps creaeted to 100 each run so the node doesn't die
  const appsToCreate = slotsAvailable > 25 ? 25 : slotsAvailable

  ctx.logger.log(`fillAppPool(): creating ${appsToCreate} apps`)

  const appsCreated = Array(appsToCreate).fill(0)

  Promise.allSettled(
    appsCreated.map(async () => {
      await createApplicationAndFund(ctx)
    })
  )
}

export async function stakeAppPool(ctx): Promise<void> {
  const appPool = await PreStakedApp.find()
  const readyPool: IPreStakedApp[] = appPool.filter(
    ({ status }) => status === APPLICATION_STATUSES.AWAITING_STAKING
  )
  // limit apps staked to 100 each run so the node doesn't die
  const appsToStake = readyPool.slice(0, 500)

  await Promise.allSettled(
    appsToStake.map(async (app) => {
      ctx.logger.log(
        `PRESTAKING APP ${app.freeTierApplicationAccount.address} for 0021`
      )
      await stakeApplication(ctx, app, '0021')
    })
  )
}
