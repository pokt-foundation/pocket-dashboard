import crypto from "crypto";
import {
  PocketAAT,
  QueryBalanceResponse,
  RawTxRequest,
} from "@pokt-network/pocket-js";
import PreStakedApp, { IPreStakedApp } from "../models/PreStakedApp";
import { chains, FREE_TIER_STAKE_AMOUNT } from "./config";
import {
  createAppStakeTx,
  createUnlockedAccount,
  getBalance,
  submitRawTransaction,
  transferFromFreeTierFund,
} from "../lib/pocket";
import { APPLICATION_STATUSES } from "../application-statuses";
import env, { PocketNetworkKeys } from "../environment";

async function createApplicationAndFund(ctx): Promise<void> {
  const { clientPubKey, aatVersion } = env(
    "POCKET_NETWORK"
  ) as PocketNetworkKeys;

  const passphrase = crypto.randomBytes(16).toString("hex");
  const freeTierAccount = await createUnlockedAccount(passphrase);

  const gatewayAat = await PocketAAT.from(
    aatVersion,
    clientPubKey,
    freeTierAccount.publicKey.toString("hex"),
    freeTierAccount.privateKey.toString("hex")
  );

  const newAppForPool: IPreStakedApp = new PreStakedApp({
    status: APPLICATION_STATUSES.AWAITING_FUNDS,
    freeTierApplicationAccount: {
      address: freeTierAccount.addressHex,
      publicKey: freeTierAccount.publicKey.toString("hex"),
      privateKey: freeTierAccount.privateKey.toString("hex"),
      passPhrase: passphrase,
    },
    gatewayAAT: {
      version: gatewayAat.version,
      clientPublicKey: gatewayAat.clientPublicKey,
      applicationPublicKey: gatewayAat.applicationPublicKey,
      applicationSignature: gatewayAat.applicationSignature,
    },
    createdAt: new Date(Date.now()),
  });

  await newAppForPool.save();

  ctx.logger.log(
    `fillAppPool(): created app with addr ${freeTierAccount.addressHex}`
  );

  const txHash = await transferFromFreeTierFund(
    FREE_TIER_STAKE_AMOUNT.toString(),
    freeTierAccount.addressHex
  );

  newAppForPool.status = APPLICATION_STATUSES.AWAITING_STAKING;
  newAppForPool.fundingTxHash = txHash;
  await newAppForPool.save();

  ctx.logger.log(
    `fillAppPool(): sent funds to account ${freeTierAccount.addressHex} on tx ${txHash}`
  );
}
async function stakeApplication(
  ctx,
  app: IPreStakedApp,
  chain = "0002"
): Promise<void> {
  console.log("Got app ", app);
  const { address, passPhrase, privateKey } = app.freeTierApplicationAccount;
  const { balance } = (await getBalance(address)) as QueryBalanceResponse;

  if (balance < FREE_TIER_STAKE_AMOUNT) {
    ctx.logger.warn(
      `NOTICE! app ${app.freeTierApplicationAccount.address} doesn't have enough funds.`
    );
    return;
  }

  ctx.logger.log(`Staking app ${address} for chain ${chain}`);

  const stakeTxToSend = await createAppStakeTx(
    passPhrase,
    Buffer.from(privateKey, "hex"),
    [chain],
    FREE_TIER_STAKE_AMOUNT.toString()
  );
  const txHash = await submitRawTransaction(
    address,
    (stakeTxToSend as RawTxRequest).txHex
  );

  app.status = APPLICATION_STATUSES.READY;
  app.stakingTxHash = txHash;
  app.chain = chain;
  await app.save();

  ctx.logger.log(
    `Sent stake request on tx ${txHash} : app ${address}, chain ${chain}`
  );
}

export async function fillAppPool(ctx): Promise<void> {
  const totalPoolSize = Object.values(chains).reduce(
    (prev, { limit }) => prev + limit,
    0
  );
  const appPool = await PreStakedApp.find();

  ctx.logger.log(
    `fillAppPool(): pool size limit ${totalPoolSize}, pool size ${appPool?.length}`
  );

  if (totalPoolSize <= appPool?.length) {
    ctx.logger.log("fillAppPool(): No need to fill the pool.");
    return;
  }

  const appsToCreate = totalPoolSize - (appPool?.length ?? 0);

  ctx.logger.log(`fillAppPool(): creating ${appsToCreate} apps`);

  Array(appsToCreate)
    .fill(0)
    .map(async () => {
      await createApplicationAndFund(ctx);
    });
}

export async function stakeAppPool(ctx): Promise<void> {
  const appPool = await PreStakedApp.find();
  const appsToStake: IPreStakedApp[] = appPool.filter(
    ({ status }) => status === APPLICATION_STATUSES.AWAITING_STAKING
  );
  const stakedApps = appPool.filter(
    ({ status }) => status === APPLICATION_STATUSES.READY
  );
  const appAllocationCount = new Map();

  if (!appsToStake.length) {
    ctx.logger.log("No apps to stake");
    return;
  }
  // fill the allocation count with the default from all chains
  for (const [, { id, limit }] of Object.entries(chains)) {
    appAllocationCount.set(id, limit);
  }
  // Now, remove the excess entries depending on the pool allocation
  for (const { chain } of stakedApps) {
    if (chain && !appAllocationCount.has(chain)) {
      ctx.logger.warn(
        `stakeAppPool(): Found chain ${chain} not found in chains config`
      );
      continue;
    }
    const currentCount = appAllocationCount.get(chain);

    appAllocationCount.set(chain, Math.max(currentCount - 1, 0));
  }
  for (const [chain, count] of appAllocationCount) {
    if (!count) {
      continue;
    }
    ctx.logger.log(`Creating ${count} apps for chain ${chain}`);
    Array(count)
      .fill(0)
      .map(async () => {
        const chosenApplication: IPreStakedApp = appsToStake.pop();

        if (!chosenApplication) {
          ctx.logger.warn(
            `NOTICE: No more space in the pool for app demand. Tried to stake app ${chosenApplication.freeTierApplicationAccount.address} for chain ${chain}`
          );
          return;
        }
        ctx.logger.log(
          `Staking application ${chosenApplication.freeTierApplicationAccount.address} for chain ${chain}`
        );
        await stakeApplication(ctx, chosenApplication, chain);
      });
  }
}
