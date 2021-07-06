import crypto from 'crypto'
import {
  PocketAAT,
  QueryBalanceResponse,
  RawTxRequest,
} from '@pokt-network/pocket-js'
import Application from '../models/Application'
import PreStakedApp, { IPreStakedApp } from '../models/PreStakedApp'
import { chains, FREE_TIER_STAKE_AMOUNT } from './config'
import {
  createAppStakeTx,
  createUnlockedAccount,
  getBalance,
  submitRawTransaction,
  transferFromFreeTierFund,
} from '../lib/pocket'
import { APPLICATION_STATUSES } from '../application-statuses'
import env, { PocketNetworkKeys } from '../environment'

async function createApplicationAndFund(ctx): Promise<void> {
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

  await newAppForPool.save()

  ctx.logger.log(
    `fillAppPool(): created app with addr ${freeTierAccount.addressHex}`
  )

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
  await newAppForPool.save()

  ctx.logger.log(
    `fillAppPool(): sent funds to account ${freeTierAccount.addressHex} on tx ${txHash}`
  )
}
async function stakeApplication(
  ctx,
  app: IPreStakedApp,
  chain = '0021'
): Promise<boolean> {
  const { address, passPhrase, privateKey } = app.freeTierApplicationAccount
  const { balance } = (await getBalance(address)) as QueryBalanceResponse

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

export async function fillAppPool(ctx): Promise<void> {
  const totalPoolSize = 100
  const appPool = await PreStakedApp.find()

  if (appPool.length > 200) {
    ctx.logger.log(
      `fillAppPool(): script not allowed to run more than once, pool size ${appPool.length}`
    )
    return
  }

  ctx.logger.log(
    `fillAppPool(): pool size limit ${totalPoolSize}, pool size ${appPool?.length}`
  )

  if (totalPoolSize <= appPool.length) {
    ctx.logger.log('fillAppPool(): No need to fill the pool.')
    return
  }

  const appsToCreate = totalPoolSize - (appPool?.length ?? 0)

  ctx.logger.log(`fillAppPool(): creating ${appsToCreate} apps`)

  Array(appsToCreate)
    .fill(0)
    .map(async () => {
      await createApplicationAndFund(ctx)
    })
}

export async function stakeAppPool(ctx): Promise<void> {
  const appPool = await PreStakedApp.find()
  const appsToStake: IPreStakedApp[] = appPool.filter(
    ({ status }) => status === APPLICATION_STATUSES.AWAITING_STAKING
  )

  Promise.all(
    appsToStake.map(async (app) => {
      ctx.logger.log(
        `PRESTAKING APP ${app.freeTierApplicationAccount.address} for 0021`
      )
      await stakeApplication(ctx, app, '0021')
    })
  )
}
