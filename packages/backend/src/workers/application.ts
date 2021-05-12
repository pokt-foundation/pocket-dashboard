import crypto from "crypto";
import { PocketAAT } from "@pokt-network/pocket-js";
import PreStakedApp from "@/models/PreStakedApp";
import { chains, FREE_TIER_STAKE_AMOUNT } from "@/workers/config";
import {
  createAppStakeTx,
  createUnlockedAccount,
  getBalance,
  submitRawTransaction,
  transferFromFreeTierFund,
} from "@/lib/pocket";
import { APPLICATION_STATUSES } from "@/application-statuses";
import env from "@/environment";

async function createApplicationAndFund(ctx) {
  const {
    free_tier: { client_pub_key: clientPubKey },
    aat_version: aatVersion,
  } = env("pocket_network");

  const passphrase = crypto.randomBytes(16).toString("hex");
  const freeTierAccount = await createUnlockedAccount(passphrase);

  const gatewayAat = await PocketAAT.from(
    aatVersion,
    clientPubKey,
    freeTierAccount.publicKey.toString("hex"),
    freeTierAccount.privateKey.toString("hex")
  );

  const newAppForPool = new PreStakedApp({
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

  // @ts-expect-error ts-migrate(2362) FIXME: The left-hand side of an arithmetic operation must... Remove this comment to see the full error message
  const appsToCreate = totalPoolSize - (appPool?.length ?? 0);

  ctx.logger.log(`fillAppPool(): creating ${appsToCreate} apps`);

  Array(appsToCreate)
    .fill(0)
    .map(async () => {
      await createApplicationAndFund(ctx);
    });
}

export async function stakeAppPool(ctx) {
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
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'id' does not exist on type '{}'.
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
        const chosenApplication = appsToStake.pop();

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
