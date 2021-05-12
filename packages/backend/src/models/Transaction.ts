export const POST_ACTION_TYPE = {
  stakeApplication: "STAKE_APPLICATION",
  stakeNode: "STAKE_NODE",
  unstakeApplication: "UNSTAKE_APPLICATION",
  unstakeNode: "UNSTAKE_NODE",
  unjailNode: "UNJAIL_NODE",
};

export class TransactionPostAction {
  /**
   * @param {string} type Type of post action.
   * @param {*} data Data used in the post action.
   */
  constructor(type, data) {
    Object.assign(this, { type, data });
  }
}

export class PocketTransaction {
  /**
   * @param {string} createdDate Created date.
   * @param {string} hash Transaction hash.
   * @param {TransactionPostAction} postAction Post action.
   * @param {boolean} completed Completed.
   */
  constructor(createdDate, hash, postAction = {}, completed = false) {
    Object.assign(this, { createdDate, hash, postAction, completed });
  }
}
