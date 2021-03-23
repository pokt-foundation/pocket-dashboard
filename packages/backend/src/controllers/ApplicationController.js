import express from "express";
import merge from "lodash.merge";
import asyncMiddleware from "middlewares/async";
import { authenticate } from "middlewares/passport-auth";
import Application from "models/Application";
import ApplicationPool from "models/PreStakedApp";
import HttpError from "errors/http-error";
import { APPLICATION_STATUSES } from "application-statuses";

const DEFAULT_GATEWAY_SETTINGS = {
  secretKey: "",
  secretKeyRequired: false,
  whitelistOrigins: [],
  whitelistUserAgents: [],
};

const router = express.Router();

router.use(authenticate);

router.get(
  "",
  asyncMiddleware(async (req, res) => {
    const id = req.user._id;
    const application = await Application.find({
      status: APPLICATION_STATUSES.READY,
      user: id,
    });

    if (!application) {
      throw HttpError.NOT_FOUND({
        errors: [{ message: "User does not have an active application" }],
      });
    }

    res.status(200).send(application);
  })
);

router.get(
  "/:applicationId",
  asyncMiddleware(async (req, res) => {
    const userId = req.user._id;
    const { applicationId } = req.params;
    const application = await Application.findById(applicationId);

    if (!application) {
      throw HttpError.NOT_FOUND({
        errors: [{ message: "User does not have an active application" }],
      });
    }

    if (application.user.toString() !== userId.toString()) {
      throw HttpError.FORBIDDEN({
        errors: [{ message: "User does not have access to this application" }],
      });
    }

    res.status(200).send(application);
  })
);

router.post(
  "",
  asyncMiddleware(async (req, res) => {
    const {
      name,
      chain,
      gatewaySettings = DEFAULT_GATEWAY_SETTINGS,
    } = req.body;

    try {
      const id = req.user._id;
      const isNewAppRequestInvalid = await Application.exists({
        status: APPLICATION_STATUSES.READY,
        user: id,
      });

      if (isNewAppRequestInvalid) {
        throw HttpError.BAD_REQUEST({
          errors: [
            {
              id: "ALREADY_EXISTING",
              message: "User already has an existing free tier app",
            },
          ],
        });
      }

      const preStakedApp = await ApplicationPool.findOne({
        status: APPLICATION_STATUSES.READY,
        chain,
      });

      if (!preStakedApp) {
        throw HttpError.BAD_REQUEST({
          errors: [
            {
              id: "POOL_EMPTY",
              message: "No pre-staked apps available for this chain.",
            },
          ],
        });
      }

      const application = new Application({
        chain,
        name,
        user: id,
        status: APPLICATION_STATUSES.READY,
        lastChangedStatusAt: new Date(Date.now()),
        // We enforce every app to be treated as a free-tier app for now.
        freeTier: true,
        freeTierApplicationAccount: preStakedApp.freeTierApplicationAccount,
        gatewayAAT: preStakedApp.gatewayAAT,
        gatewaySettings,
      });

      await application.save();

      const { ok } = await ApplicationPool.deleteOne({ _id: preStakedApp._id });

      if (Number(ok) !== 1) {
        throw HttpError.INTERNAL_SERVER_ERROR({
          errors: [
            {
              id: "DB_ERROR",
              message: "There was an error while updating the DB",
            },
          ],
        });
      }
      res.status(200).send(application);
    } catch (err) {
      throw HttpError.INTERNAL_SERVER_ERROR(err);
    }
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
      const userId = req.user._id;

      if (application.user !== userId) {
        throw HttpError.BAD_REQUEST({
          message: "Application does not belong to user",
        });
      }

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
