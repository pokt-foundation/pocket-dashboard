import crypto from "crypto";
import PreStakedApp from "models/PreStakedApp";
import { CHAINS } from "workers/utils";
import {
  createAppStakeTx,
  createUnlockedAccount,
  getBalance,
  submitRawTransaction,
  transferFromFreeTierFund,
} from "lib/pocket";
import { APPLICATION_STATUSES } from "application-statuses";
// TODO: Add Sentry, logger

const FREE_TIER_STAKE_AMOUNT = 24950100000n;

async function createApplicationAndFund(ctx) {
  const passphrase = crypto.randomBytes(16).toString("hex");
  const freeTierAccount = await createUnlockedAccount(passphrase);
  const newAppForPool = new PreStakedApp({
    status: APPLICATION_STATUSES.AWAITING_FUNDS,
    // TODO: Encrypt info
    freeTierApplicationAccount: {
      address: freeTierAccount.addressHex,
      publicKey: freeTierAccount.publicKey.toString("hex"),
      privateKey: freeTierAccount.privateKey.toString("hex"),
      passPhrase: passphrase,
    },
    createdAt: new Date(Date.now()),
  });

  await newAppForPool.save();

  ctx.logger.log(
    `fillAppPool(): created app with addr ${freeTierAccount.addressHex}`
  );

  const txHash = await transferFromFreeTierFund(
    FREE_TIER_STAKE_AMOUNT,
    freeTierAccount.addressHex
  );

  newAppForPool.status = APPLICATION_STATUSES.AWAITING_STAKING;
  newAppForPool.fundingTxHash = txHash;
  await newAppForPool.save();

  ctx.logger.log(
    `fillAppPool(): sent funds to account ${freeTierAccount.addressHex} on tx ${txHash}`
  );
}

async function stakeApplication(ctx, app, chain = "0002") {
  const { address, passPhrase, privateKey } = app.freeTierApplicationAccount;
  const { balance } = await getBalance(address);

  if (balance < FREE_TIER_STAKE_AMOUNT) {
    ctx.logger.warn(
      `NOTICE! app ${app.freeTierApplicationAccount.address} doesn't have enough funds.`
    );

    return;
  }

  ctx.logger.log(`Staking app ${address} for chain ${chain}`);

  const stakeTxToSend = await createAppStakeTx(
    address,
    passPhrase,
    Buffer.from(privateKey, "hex"),
    [chain],
    FREE_TIER_STAKE_AMOUNT
  );

  const txHash = await submitRawTransaction(address, stakeTxToSend.txHex);

  app.status = APPLICATION_STATUSES.READY;
  app.stakingTxHash = txHash;
  app.chain = chain;
  await app.save();

  ctx.logger.log(
    `Sent stake request on tx ${txHash} : app ${address}, chain ${chain}`
  );
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
  const appsToStake = appPool.filter(
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
  for (const [, { id, limit }] of Object.entries(CHAINS)) {
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
        const chosenApplication = appsToStake.pop();

        if (!chosenApplication) {
          ctx.logger.warn("NOTICE: No more space in the pool for app demand.");
          return;
        }

        ctx.logger.log(
          `Staking application ${chosenApplication.freeTierApplicationAccount.address} for chain ${chain}`
        );

        await stakeApplication(ctx, chosenApplication, chain);
      });
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
