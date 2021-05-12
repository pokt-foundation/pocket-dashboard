// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'controllers/ApplicationControl... Remove this comment to see the full error message
import Application from "@/controllers/ApplicationController";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'controllers/DefaultController'... Remove this comment to see the full error message
import Index from "@/controllers/DefaultController";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'controllers/NetworkController'... Remove this comment to see the full error message
import Network from "@/controllers/NetworkController";
// @ts-expect-error ts-migrate(2307) FIXME: Cannot find module 'controllers/UserController' or... Remove this comment to see the full error message
import User from "@/controllers/UserController";

export function configureRoutes(expressApp) {
  expressApp.use("/", Index);

  expressApp.use("/api/users", User);

  expressApp.use("/api/applications", Application);

  expressApp.use("/api/network", Network);
}
