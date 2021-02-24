import TransactionService from "./services/TransactionService";
import PocketService from "./services/PocketService";
import EmailService from "./services/EmailService";
import CronJobService from "./services/CronJobService";
import ApplicationService from "./services/ApplicationService";
import cron from "node-cron";

import { RpcError, typeGuard } from "@pokt-network/pocket-js";
import { POST_ACTION_TYPE } from "./models/Transaction";
import { BOND_STATUS, STAKE_STATUS, CronJobData } from "./models/CronJobData";

/**
 * Start the cron jobs
 *
 */
export function startCronJobs() {
  const TRANSACTION_SERVICE = new TransactionService();
  const POCKET_SERVICE = new PocketService();
  const APPLICATION_SERVICE = new ApplicationService();
  const CRON_SERVICE = new CronJobService();

  cron.schedule("0 */20 * * * *", async () => {
    let height = await POCKET_SERVICE.getBlockHeight();
    const cronJobData = await CRON_SERVICE.getEntity();

    height = Number(height);
    console.log("CRON JOBS - STARTED");
    console.log("CRON JOBS - SCHEDULE Block Height = " + height);
    console.log("cronJobData.lastHeight = " + cronJobData.lastHeight);
    if (height !== cronJobData.lastHeight) {
      runPendingTransaction(cronJobData);
      runAppStakeProcess(cronJobData);
      runAppUnstakeProcess(cronJobData);

      cronJobData.lastHeight = height;
      CRON_SERVICE.update(cronJobData.id, cronJobData);
    }
  });

  /**
   * Run every pending transaction for each app and node
   *
   * @param {CronJobData} cronJobData Cron job data.
   *
   * @throws {Error}
   * @async
   */
  function runPendingTransaction(cronJobData) {
    const start = async () => {
      await asyncForEach(
        cronJobData.pendingTransactions,
        async (pocketTransaction) => {
          const hash = pocketTransaction.hash;
          const transactionOrError = await POCKET_SERVICE.getTransaction(hash);

          if (typeGuard(transactionOrError, RpcError)) {
            throw new Error(transactionOrError.message);
          }

          const transaction = transactionOrError;

          if (transaction.hash === hash) {
            const markedTransactionSuccess = await TRANSACTION_SERVICE.markTransactionSuccess(
              pocketTransaction
            );

            if (markedTransactionSuccess) {
              if (
                pocketTransaction.postAction &&
                pocketTransaction.postAction !== {}
              ) {
                const postAction = pocketTransaction.postAction;

                switch (postAction.type) {
                  case POST_ACTION_TYPE.stakeApplication: {
                    const appStakeTransaction =
                      postAction.data.appStakeTransaction;

                    const stakeAppPostActionHash = await POCKET_SERVICE.submitRawTransaction(
                      appStakeTransaction.address,
                      appStakeTransaction.txHex
                    );

                    await TRANSACTION_SERVICE.addAppStakeTransaction(
                      stakeAppPostActionHash,
                      postAction.data
                    );
                    await CRON_SERVICE.removePendingTransaction(
                      pocketTransaction
                    );
                    break;
                  }
                  case POST_ACTION_TYPE.stakeNode: {
                    const nodeStakeTransaction =
                      postAction.data.nodeStakeTransaction;
                    const stakeNodePostActionHash = await POCKET_SERVICE.submitRawTransaction(
                      nodeStakeTransaction.address,
                      nodeStakeTransaction.raw_hex_bytes
                    );

                    await TRANSACTION_SERVICE.addNodeStakeTransaction(
                      stakeNodePostActionHash,
                      postAction.data
                    );
                    await CRON_SERVICE.removePendingTransaction(
                      pocketTransaction
                    );
                    break;
                  }
                  default:
                    throw new Error(
                      `Invalid Post Action: ${JSON.stringify(postAction)}`
                    );
                }
              }
            } else {
              throw new Error(
                "Failed to mark transaction as success/completed."
              );
            }
          }
        }
      );
    };

    start();
  }

  /**
   * Runs an app stake process
   *
   * @param {CronJobData} cronJobData Cron job data.
   *
   * @throws {Error}
   * @async
   */
  function runAppStakeProcess(cronJobData) {
    const start = async () => {
      await asyncForEach(
        cronJobData.appStakeTransactions,
        async (applicationStakePocketTransaction) => {
          const hash = applicationStakePocketTransaction.hash;
          const transactionOrError = await POCKET_SERVICE.getTransaction(hash);

          if (typeGuard(transactionOrError, RpcError)) {
            throw new Error(transactionOrError.message);
          }

          const postAction = applicationStakePocketTransaction.postAction;

          const {
            address,
            contactEmail,
            emailData,
            paymentEmailData,
          } = postAction.data;

          const {
            pocketApplication,
            networkData,
            error,
          } = await APPLICATION_SERVICE.getApplication(address);
          const hasError = error ? true : false;
          const errorType = hasError === true ? error : "";

          if (hasError || pocketApplication === undefined) {
            throw new Error(
              errorType !== ""
                ? errorType
                : "Failed to retrieve the application data from the DB."
            );
          }

          const status = getStakeStatus(parseInt(networkData.status));

          if (status === STAKE_STATUS.Staked) {
            await EmailService.to(contactEmail).sendStakeAppEmail(
              contactEmail,
              emailData,
              paymentEmailData
            );

            await APPLICATION_SERVICE.changeUpdatingStatus(address, false);

            await CRON_SERVICE.removeAppStakeTransaction(
              applicationStakePocketTransaction
            );
          }
        }
      );
    };

    start();
  }

  /**
   * Runs an app unstake process
   *
   * @param {CronJobData} cronJobData Cron job data.
   *
   * @throws {Error}
   * @async
   */
  function runAppUnstakeProcess(cronJobData) {
    const start = async () => {
      await asyncForEach(
        cronJobData.appUnstakeTransactions,
        async (appUnstakePocketTransaction) => {
          const hash = appUnstakePocketTransaction.hash;
          const transactionOrError = await POCKET_SERVICE.getTransaction(hash);

          if (typeGuard(transactionOrError, RpcError)) {
            throw new Error(transactionOrError.message);
          }

          // Submit App Stake Email
          const postAction = appUnstakePocketTransaction.postAction;

          const {
            contactEmail,
            userName,
            applicationData,
            address,
          } = postAction.data;

          const {
            pocketApplication,
            networkData,
            error,
          } = await APPLICATION_SERVICE.getApplication(address);

          const hasError = error ? true : false;
          const errorType = hasError === true ? error : "";

          if (hasError || pocketApplication === undefined) {
            throw new Error(
              errorType !== ""
                ? errorType
                : "Failed to retrieve the application data from the DB."
            );
          }

          const status = getStakeStatus(parseInt(networkData.status));

          if (status === STAKE_STATUS.Unstaked) {
            await EmailService.to(contactEmail).sendUnstakeAppEmail(
              userName,
              applicationData
            );

            await APPLICATION_SERVICE.changeUpdatingStatus(address, false);

            await CRON_SERVICE.removeAppUnstakeTransaction(
              appUnstakePocketTransaction
            );
          }
        }
      );
    };

    start();
  }

  /**
   * Runs an async call for a one or more records
   *
   * @param {Array} array List of async calls
   * @param {object} callback Async callback
   *
   * @throws {Error}
   * @async
   */
  async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  }
  /**
   * Return the stake status
   *
   * @param {string} status Staking status.
   * @returns {string} Staking status
   * @throws {Error}
   */
  function getStakeStatus(status) {
    return typeof status === "string"
      ? STAKE_STATUS[status]
      : BOND_STATUS[status];
  }
}
