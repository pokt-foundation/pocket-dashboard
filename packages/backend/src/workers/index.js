import cron from "node-cron";
import { workers } from "workers/config";
import Logger from "@pokt-foundation/pocket-dashboard-shared/helpers/logger";

const ONE_SECOND = 1000;

export function startWorkers() {
  Logger.setDefaults({ silent: false, verbose: true });
  const logger = Logger("dashboard-workers");

  for (const { name, color, workerFn, recurrence } of workers) {
    cron.schedule(recurrence, async function handleWorkerProcess() {
      let startTime = Date.now();
      let endTime;
      const startInUtc = new Date(startTime).toUTCString();

      logger.log(
        `Starting worker "${name}" at ${startInUtc} with color ${color}`
      );

      try {
        await workerFn({ logger });

        endTime = Date.now();
        const endInUtc = new Date(endTime).toUTCString();
        const elapsedTime = (endTime - startTime) / ONE_SECOND;

        logger.success(
          `Worker ${name} exited successfully at ${endInUtc}, took ${elapsedTime} seconds`
        );
      } catch (err) {
        logger.error(`Worker ${name} exited with an error.`);
        // TODO: Send metrics to sentry
        logger.log(err.message);
      }
    });
  }
}
