import express from "express";
import merge from "lodash.merge";
import asyncMiddleware from "middlewares/async";
import Application from "models/Application";
import ApplicationPool from "models/PreStakedApp";
import User from "models/User";
import HttpError from "errors/http-error";
import { APPLICATION_STATUSES } from "application-statuses";

const router = express.Router();

router.get(
  "/:applicationId",
  asyncMiddleware(async (req, res) => {
    /** @type {{applicationId:string}} */
    const { applicationId } = req.params;

    // TODO: Verify app belongs to client
    const application = await Application.findById(applicationId);

    res.status(200).send(application);
  })
);

router.post(
  "",
  asyncMiddleware(async (req, res) => {
    /** @type {{application: {name:string, owner:string, contactEmail:string, user:string }}} */
    const { name, chain, email, gatewaySettings } = req.body;

    try {
      const user = await User.findOne({ email });
      const id = user._id;

      const preStakedApp = ApplicationPool.findOne({
        status: APPLICATION_STATUSES.READY,
        chain,
      });

      if (!preStakedApp) {
        throw new Error("No application available");
      }

      const application = new Application({
        chain,
        name,
        user: id,
        status: APPLICATION_STATUSES.READY,
        lastChangedStatusAt: Date.now(),
        // We enforce every app to be treated as a free-tier app for now.
        freeTier: true,
        freeTierApplicationAccount: preStakedApp.freeTierApplicationAccount,
        gatewayAAT: preStakedApp.gatewayAAT,
        gatewaySettings,
      });

      await application.save();

      const { ok } = await ApplicationPool.deleteOne({ _id: preStakedApp._id });

      if (Number(ok) !== 1) {
        throw new Error("There was a problem while updating the DB");
      }
      // TODO: Send application creation email
    } catch (err) {
      throw HttpError.INTERNAL_SERVER_ERROR(err);
    }

    res.status(204).send();
  })
);

router.put(
  "/:applicationId",
  asyncMiddleware(async (req, res) => {
    /** @type {{name:string, owner:string, url:string, contactEmail:string, user:string, description:string, icon:string}} */
    const data = req.body;

    /** @type {{applicationId:string}} */
    const { applicationId } = req.params;

    try {
      const application = await Application.findById(applicationId);

      if (!application) {
        throw HttpError.BAD_REQUEST({ message: "Application not found" });
      }

      // TODO: find user by the authorization header and verify if it belongs to him

      // lodash's merge mutates the target object passed in.
      // This is what we want, as we don't want to lose any of the mongoose functionality
      // while at the same time updating the model itself
      const mutatedApplication = merge(application, data);
      const savedApplication = await mutatedApplication.save();

      if (!savedApplication) {
        throw new Error("There was an error while updating to the DB");
      }
    } catch (err) {
      throw HttpError.INTERNAL_SERVER_ERROR(err);
    }

    res.status(204).send();
  })
);

router.post(
  "/switch-chains/:applicationId",
  asyncMiddleware(async (req, res) => {
    const { chain } = req.body;
    const { applicationId } = req.params;

    try {
      const replacementApplication = await ApplicationPool.findOne({
        chain,
        status: APPLICATION_STATUSES.READY,
      });

      if (!replacementApplication) {
        throw new Error("No application for the selected chain is available");
      }

      const oldApplication = await Application.findById(applicationId);

      if (!oldApplication) {
        throw new Error("Cannot find application");
      }

      // TODO: Check if at least a week has passed since the last status update.

      // Set old app in the 1 week grace period
      oldApplication.status = APPLICATION_STATUSES.AWAITING_GRACE_PERIOD;
      oldApplication.lastChangedStatusAt = Date.now();
      await oldApplication.save();

      // Create a new Application for the user and copy the previous user config
      const newReplacementApplication = new Application({
        // As we're moving to a new chain, everything related to the account and gateway AAT
        // information will change, so we use all the data from the application that we took
        // from the pool.
        chain: replacementApplication.chain,
        freeTierApplicationAccount:
          replacementApplication.freeTierApplicationAccount,
        gatewayAAT: replacementApplication.gatewayAAT,
        status: APPLICATION_STATUSES.READY,
        lastChangedStatusAt: Date.now(),
        freeTier: true,
        // We wanna preserve user-related configuration fields, so we just copy them over
        // from the old application.
        name: oldApplication.name,
        user: oldApplication.user,
        gatewaySettings: oldApplication.gatewaySettings,
      });

      await newReplacementApplication.save();
    } catch (err) {
      throw HttpError.INTERNAL_SERVER_ERROR(err);
    }

    res.status(204).send();
  })
);

export default router;
