import { app } from "app";
import { startCronJobs } from "CronJob";

startCronJobs();

const PORT = process.env.PORT || 4200;

app.listen(PORT, () => {
  console.log(`App listening to ${PORT}....`);
  console.log("Press Ctrl+C to quit.");
});
