import { PocketTransaction } from "./Transaction";
export const BOND_STATUS = {
  2: "Staked",
  1: "Unstaking",
  0: "Unstaked",
};
export const STAKE_STATUS = {
  Staked: "Staked",
  Unstaking: "Unstaking",
  Unstaked: "Unstaked",
  2: "Staked",
  1: "Unstaking",
  0: "Unstaked",
};
export class CronJobData {
  /**
   * @param {string} id The ID of the entity.
   * @param {number} lastHeight The last block height.
   * @param {PocketTransaction[]} pendingTransactions List of Pending Transactions.
   * @param {PocketTransaction[]} appStakeTransactions List of AppStake Transactions.
   * @param {PocketTransaction[]} nodeStakeTransactions List of NodeStake Transactions.
   * @param {PocketTransaction[]} appUnstakeTransactions List of AppUnstake Transactions.
   * @param {PocketTransaction[]} nodeUnstakeTransactions List of NodeUnstake Transactions.
   * @param {PocketTransaction[]} nodeUnjailTransactions List of NodeUnjail Transactions.
   */
  constructor(
    id,
    lastHeight,
    pendingTransactions,
    appStakeTransactions,
    nodeStakeTransactions,
    appUnstakeTransactions,
    nodeUnstakeTransactions,
    nodeUnjailTransactions
  ) {
    Object.assign(this, {
      id,
      lastHeight,
      pendingTransactions,
      appStakeTransactions,
      nodeStakeTransactions,
      appUnstakeTransactions,
      nodeUnstakeTransactions,
      nodeUnjailTransactions,
    });
  }
  static newInstance(dbArray) {
    // @ts-expect-error ts-migrate(2554) FIXME: Expected 8 arguments, but got 0.
    const cronJobData = new CronJobData();
    const data = dbArray[0];

    (cronJobData as any).id = data.id;
    (cronJobData as any).lastHeight = data.lastHeight;
    (cronJobData as any).pendingTransactions = data.pendingTransactions ?? [];
    (cronJobData as any).appStakeTransactions = data.appStakeTransactions ?? [];
    (cronJobData as any).nodeStakeTransactions =
      data.nodeStakeTransactions ?? [];
    (cronJobData as any).appUnstakeTransactions =
      data.appUnstakeTransactions ?? [];
    (cronJobData as any).nodeUnstakeTransactions =
      data.nodeUnstakeTransactions ?? [];
    (cronJobData as any).nodeUnjailTransactions =
      data.nodeUnjailTransactions ?? [];
    return cronJobData;
  }
}
