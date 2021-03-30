import { startServer } from "App";
import { startWorkers } from "workers";
import env from "environment";

startServer();

if (env("enable_workers")) {
  startWorkers();
} else {
  console.log("--- WORKERS NOT ENABLED ---");
}
