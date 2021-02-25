import express from "express";
import ApplicationService from "services/ApplicationService";
import { getOptionalQueryOption, getQueryOption } from "helpers/utils";
import asyncMiddleware from "middlewares/async";
import EmailService from "services/EmailService";
import UserService from "services/UserService";

const router = express.Router();

const userService = new UserService();
const applicationService = new ApplicationService();

/**
 * Create new application.
 */
router.post(
  "",
  asyncMiddleware(async (req, res) => {
    /** @type {{application: {name:string, owner:string, url:string, contactEmail:string, user:string, description:string, icon:string}}} */
    const data = req.body;

    const applicationID = await applicationService.createApplication(
      data.application
    );

    res.send(applicationID);
  })
);

/**
 * Save application account.
 */
router.post(
  "/account",
  asyncMiddleware(async (req, res) => {
    /** @type {{applicationID: string, applicationData: {address: string, publicKey: string}, applicationBaseLink:string, ppkData?: object}} */
    const data = req.body;

    const application = await applicationService.saveApplicationAccount(
      data.applicationID,
      data.applicationData
    );
    const emailAction = data.ppkData ? "imported" : "created";
    const applicationEmailData = {
      name: application.name,
      link: `${data.applicationBaseLink}/${data.applicationData.address}`,
    };

    if (emailAction) {
      await EmailService.to(
        application.contactEmail
      ).sendCreateOrImportAppEmail(
        emailAction,
        application.contactEmail,
        applicationEmailData
      );
    }

    res.send(application);
  })
);

/**
 * Update an application.
 */
router.put(
  "/:applicationId",
  asyncMiddleware(async (req, res) => {
    /** @type {{name:string, owner:string, url:string, contactEmail:string, user:string, description:string, icon:string}} */
    let data = req.body;

    /** @type {{applicationId:string}} */
    const params = req.params;

    if (
      await applicationService.verifyApplicationBelongsToClient(
        params.applicationId,
        req.headers.authorization
      )
    ) {
      const updated = await applicationService.updateApplication(
        params.applicationId,
        data
      );

      res.send(updated);
    } else {
      res.status(400).send("Application doesn't belong to the client account.");
    }
  })
);

/**
 * Delete an application from dashboard.
 */
router.post(
  "/:applicationId",
  asyncMiddleware(async (req, res) => {
    /** @type {{applicationId:string}} */
    const data = req.params;
    /** @type {{user:string, appsLink:string}} */
    const bodyData = req.body;

    if (
      await applicationService.verifyApplicationBelongsToClient(
        data.applicationId,
        req.headers.authorization
      )
    ) {
      const application = await applicationService.deleteApplication(
        data.applicationId,
        bodyData.user
      );

      if (application) {
        const applicationEmailData = {
          name: application.name,
          appsLink: bodyData.appsLink,
        };

        await EmailService.to(application.contactEmail).sendAppDeletedEmail(
          application.contactEmail,
          applicationEmailData
        );
      }

      res.send(application !== undefined);
    } else {
      res.status(400).send("Application doesn't belong to the client account.");
    }
  })
);

/**
 * Get staked summary data.
 */
router.get(
  "/summary/staked",
  asyncMiddleware(async (req, res) => {
    const summaryData = await applicationService.getStakedApplicationSummary();

    res.json(summaryData);
  })
);

/**
 * Get application that is already on dashboard by address.
 */
router.get(
  "/:applicationAccountAddress",
  asyncMiddleware(async (req, res) => {
    /** @type {{applicationAccountAddress:string}} */
    const data = req.params;
    const application = await applicationService.getApplication(
      data.applicationAccountAddress
    );

    res.json(application);
  })
);

/**
 * Get application that is already on dashboard using the application id.
 */
router.get(
  "/client/:applicationId",
  asyncMiddleware(async (req, res) => {
    /** @type {{applicationId:string}} */
    const data = req.params;

    if (
      await applicationService.verifyApplicationBelongsToClient(
        data.applicationId,
        req.headers.authorization
      )
    ) {
      const application = await applicationService.getClientApplication(
        data.applicationId
      );

      res.json(application);
    } else {
      res.status(400).send("Application doesn't belong to the client account.");
    }
  })
);

/**
 * Get all user applications.
 */
router.post(
  "/user/all",
  asyncMiddleware(async (req, res) => {
    const limit = parseInt(getQueryOption(req, "limit"));

    const offsetData = getOptionalQueryOption(req, "offset");
    const offset = offsetData !== "" ? parseInt(offsetData) : 0;

    /** @type {{user: string}} */
    const data = req.body;

    if (
      await userService.verifySessionForClient(
        req.headers.authorization,
        data.user
      )
    ) {
      const applications = await applicationService.getUserApplications(
        data.user,
        limit,
        offset
      );

      res.json(applications);
    } else {
      res
        .status(400)
        .send(
          "Application list doesn't belong to the provided client account."
        );
    }
  })
);

/**
 * Stake a free tier application.
 */
router.post(
  "/freetier/stake",
  asyncMiddleware(async (req, res) => {
    // [>* @type {{stakeInformation: {client_address: string, chains: string[], stake_amount: string}, applicationLink: string}} <]
    const data = req.body;

    const stakeInformation = data.stakeInformation;
    const application = await applicationService.getApplication(
      stakeInformation.client_address
    );

    const applicationEmailData = {
      name: application.pocketApplication.name,
      link: data.applicationLink,
    };

    const aat = await applicationService.stakeFreeTierApplication(
      application,
      stakeInformation,
      applicationEmailData
    );

    res.json(aat);
  })
);

/**
 * Get AAT for Free tier
 */
router.get(
  "/freetier/aat/:applicationId",
  asyncMiddleware(async (req, res) => {
    /** @type {{applicationId:string}} */
    const data = req.params;

    if (
      await applicationService.verifyApplicationBelongsToClient(
        data.applicationId,
        req.headers.authorization
      )
    ) {
      const aat = await applicationService.getFreeTierAAT(data.applicationId);

      res.json(aat);
    } else {
      res
        .status(400)
        .send("Application doesn't belong to the provided client account.");
    }
  })
);

router.post(
  "/update/gateway/settings",
  asyncMiddleware(async (req, res) => {
    const data = req.body;
    const applicationId = data.id;

    if (
      await applicationService.verifyApplicationBelongsToClient(
        applicationId,
        req.headers.authorization
      )
    ) {
      const updated = await applicationService.updateApplication(
        applicationId,
        data
      );

      res.send(updated);
    } else {
      res
        .status(400)
        .send("Application doesn't belong to the provided client account.");
    }
  })
);

export default router;
