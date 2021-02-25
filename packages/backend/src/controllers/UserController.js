import express from "express";
import asyncMiddleware from "middlewares/async";
import { DashboardValidationError } from "models/Exceptions";
import EmailService from "services/EmailService";
import UserService from "services/UserService";

const router = express.Router();

const userService = new UserService();

/**
 * Check if user exists.
 */
router.post(
  "/exists",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string, authProvider: string}} */
    const data = req.body;

    const exists = await userService.userExists(data.email, data.authProvider);

    res.send(exists);
  })
);

/**
 * User authentication using username and password.
 */
router.post(
  "/login",
  asyncMiddleware(async (req, res) => {
    /** @type {{username:string, password:string}} */
    const data = req.body;

    // TODO: Introduce some sort of user email validation.
    const userSession = await userService.authenticateUser(
      data.username,
      data.password
    );

    res.json(userSession);
  })
);

/**
 * User sign up using email.
 */
router.post(
  "/signup",
  asyncMiddleware(async (req, res) => {
    const data = req.body;

    const result = await userService.signupUser(data);

    if (result) {
      const postValidationLink = `${
        data.postValidationBaseLink
      }?d=${await userService.generateToken(data.email)}`;

      await EmailService.to(data.email).sendSignUpEmail(
        data.username,
        postValidationLink
      );
    }

    res.send(result);
  })
);

/**
 * User sign up using email.
 */
router.post(
  "/resend-signup-email",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string, postValidationBaseLink:string}} */
    const data = req.body;

    const user = await userService.getUser(data.email);

    if (user) {
      const postValidationLink = `${
        data.postValidationBaseLink
      }?d=${await userService.generateToken(data.email)}`;

      await EmailService.to(data.email).sendSignUpEmail(
        user.username,
        postValidationLink
      );
    }

    res.send(user !== undefined);
  })
);

/**
 * User logout.
 */
router.post(
  "/logout",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string}} */
    const data = req.body;

    const result = await userService.logout(data.email);

    res.send(result);
  })
);

/**
 * Check if user is validated.
 */
router.post(
  "/is-validated",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string, authProvider: string}} */
    const data = req.body;

    const validated = await userService.isUserValidated(
      data.email,
      data.authProvider
    );

    res.send(validated);
  })
);

/**
 * Change user password.
 */
router.put(
  "/change-password",
  asyncMiddleware(async (req, res) => {
    /** @type {{email: string, oldPassword: string, password1: string, password2: string}} */
    const data = req.body;

    const passwordChanged = await userService.changePassword(
      data.email,
      data.oldPassword,
      data.password1,
      data.password2
    );

    if (passwordChanged) {
      await EmailService.to(data.email).sendPasswordChangedEmail(data.email);
    }

    res.send(passwordChanged);
  })
);

/**
 * Reset the user password.
 */
router.put(
  "/reset-password",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string, token: string, password1: string, password2: string}} */
    const data = req.body;

    const passwordChanged = await userService.resetPassword(
      data.email,
      data.token,
      data.password1,
      data.password2
    );

    if (passwordChanged) {
      await EmailService.to(data.email).sendPasswordChangedEmail(data.email);
    }

    res.send(passwordChanged);
  })
);

/**
 * Send's to the user a password reset email.
 */
router.put(
  "/send-reset-password-email",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string, passwordResetLinkPage: string}} */
    const data = req.body;

    const token = await userService.retrievePasswordResetToken(data.email);

    if (typeof token === "string") {
      await EmailService.to(data.email).sendResetPasswordEmail(
        data.email,
        token,
        data.passwordResetLinkPage
      );
    }

    res.send(true);
  })
);

/**
 * Validate token.
 */
router.post(
  "/validate-token",
  asyncMiddleware(async (req, res) => {
    /** @type {{token:string}} */
    const data = req.body;

    /** @type {{email:string}} */
    const tokenPayload = await userService.decodeToken(data.token, true);

    if (tokenPayload instanceof DashboardValidationError) {
      res.json({ success: false, data: tokenPayload.message });
    } else {
      const userEmail = tokenPayload.email;

      if (await userService.userExists(userEmail)) {
        const user = await userService.getUser(userEmail);

        res.json({ success: true, data: user });
      } else {
        res.json({
          success: false,
          data: "User does not exists or is invalid.",
        });
      }
    }
  })
);

/**
 * Validate captcha token
 */
router.post(
  "/verify-captcha",
  asyncMiddleware(async (req, res) => {
    /** @type {{token:string}} */
    const { token } = req.body;
    const result = await userService.verifyCaptcha(token);

    res.json(result.data);
  })
);

/**
 * Unsubscribe email
 */
router.post(
  "/unsubscribe",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string}} */
    const data = req.body;

    const unsubscribed = await EmailService.to(data.email).unsubscribeEmail();

    res.send(unsubscribed);
  })
);

/**
 * Subscribe email
 */
router.post(
  "/subscribe",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string}} */
    const data = req.body;

    const subscribed = await EmailService.to(data.email).subscribeEmail();

    res.send(subscribed);
  })
);

export default router;
