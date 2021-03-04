import crypto from "crypto";
import PreStakedApp from "models/PreStakedApp";
import { CHAINS } from "workers/utils";
import {
  createUnlockedAccount,
  getBalance,
  transferFromFreeTierFund,
} from "lib/pocket";
import { APPLICATION_STATUSES } from "application-statuses";
// TODO: Add Sentry, logger

async function createApplicationAndFund(ctx) {
  const passphrase = crypto.randomBytes(16).toString("hex");
  const freeTierAccount = await createUnlockedAccount(passphrase);
  const newAppForPool = new PreStakedApp({
    status: APPLICATION_STATUSES.AWAITING_FUNDS,
    freeTierApplicationAccount: {
      address: freeTierAccount.addressHex,
      publicKey: freeTierAccount.publicKey.toString("hex"),
      privateKey: freeTierAccount.privateKey.toString("hex"),
    },
    createdAt: new Date(Date.now()),
  });

  await newAppForPool.save();

  ctx.logger.log(
    `fillAppPool(): created app with addr ${freeTierAccount.addressHex}`
  );

  const txHash = await transferFromFreeTierFund(
    100000,
    freeTierAccount.addressHex
  );

  ctx.logger.log(
    `fillAppPool(): funded account ${freeTierAccount.addressHex} on tx ${txHash}`
  );
}

async function stakeApplication(ctx, app, chain) {
  // TODO: Check if app can be staked (has funds)
  const address = app.freeTierApplicationAccount.address;
  const balance = await getBalance(address);

  console.log(`${address}`, balance);
  // TODO: Stake app for selected chain
}

async function unstakeApplication(app) {
  // TODO: Check if app can be unstaked
  // TODO: Unstake and set for decomissioning
}

async function defundApplication(app) {
  // TODO: Cehck if app can be defunded (has been unstaked)
  // TODO: Send funds back to main account and set as decomissioned
}

export async function fillAppPool(ctx) {
  // TODO: Loop for each chain and
  // 1. Determine how many apps exist in the pool
  // 2. if less than limit, run createApplicationAndFund()
  // 3. Log
  //    - number of apps created
  //    - chain they were created for
  const totalPoolSize = Object.values(CHAINS).reduce(
    (prev, { limit }) => prev + limit,
    0
  );
  const appPool = await PreStakedApp.find();

  ctx.logger.log(
    `fillAppPool(): pool size limit ${totalPoolSize}, pool size ${appPool?.length}`
  );

  if (totalPoolSize === appPool?.length) {
    ctx.logger.log("fillAppPool(): No need to fill the pool.");
  }

  const appsToCreate = totalPoolSize - (appPool?.length ?? 0);

  ctx.logger.log(`fillAppPool(): creating ${appsToCreate} apps`);

  Array(appsToCreate)
    .fill(0)
    .map(async () => {
      await createApplicationAndFund(ctx);
    });
}

export async function stakeAppPool(ctx) {
  // TODO: Loop for each chain and
  // 1. stake each app that isn't staaked but has funds to stake
  // 2. Log
  //    - number of apps staked
  //    - chain they were staked for
  const appPool = await PreStakedApp.find();

  for (const app of appPool) {
    await stakeApplication(ctx, app);
  }
}

export async function unstakeAvailableApps() {
  // TODO: Loop for each chain and
  // 1. See which apps are un-stake-able
  //    - Grace period of 1 week is gone
  //    - On top of that, are not in the 21-staking-day-gap
  // 2. Unstake each app and set for decomissioning
  // 3. Log
  //    - number of apps unstaked
  //    - chain they were created for
}
