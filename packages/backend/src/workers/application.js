import PreStakedApp from "models/PreStakedApp";
import { CHAINS } from "workers/utils";
// TODO: Add Sentry, logger

async function createApplicationAndFund(chain) {
  // TODO: Create application credentials
  // TODO: Create application in DB
  // TODO: Send funds from Main account to App
}

async function stakeApplication(app, chain) {
  // TODO: Check if app can be staked (has funds)
  //
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

export async function fillAppPool() {
  // TODO: Loop for each chain and
  // 1. Determine how many apps exist for that chain
  // 2. if less than limit, run createApplicationAndFund()
  // 3. Log
  //    - number of apps created
  //    - chain they were created for
}

export async function stakeAppPool() {
  // TODO: Loop for each chain and
  // 1. stake each app that isn't staaked but has funds to stake
  // 2. Log
  //    - number of apps staked
  //    - chain they were staked for
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
