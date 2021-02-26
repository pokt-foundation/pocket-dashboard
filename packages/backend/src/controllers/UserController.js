import express from "express";
import asyncMiddleware from "middlewares/async";
import EmailService from "services/EmailService";
import UserService from "services/UserService";
import User from "models/User";
import HttpError from "errors/http-error";

const DEFAULT_PROVIDER = "EMAIL";

const router = express.Router();

const userService = new UserService();

/**
 * Check if user exists.
 */
router.post(
  "/exists",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string, authProvider: string}} */
    const { email } = req.body;

    const exists = await User.exists({ email });

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
    const { email, password } = data;

    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError.BAD_REQUEST({ error: "user not found" });
    }

    const isPasswordMatching = await User.comparePassword(
      password,
      user.password
    );

    if (!isPasswordMatching) {
      throw HttpError.BAD_REQUEST({ error: "Passwords don't match" });
    }

    // TODO: Introduce some sort of user email validation.
    const userSession = await User.generateNewSessionTokens(
      user._id,
      user.email
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
    const { email, password1, password2 } = data;

    const isEmailValid = User.validateEmail(email);

    if (!isEmailValid) {
      throw HttpError.BAD_REQUEST({ message: "email is not valid" });
    }

    if (password1 !== password2) {
      throw HttpError.BAD_REQUEST({ message: "Passwords do not match" });
    }

    const dbUser = await User.exists({ email });

    if (dbUser) {
      throw HttpError.BAD_REQUEST({ message: "Email already in use" });
    }

    const encryptedPassword = await User.encryptPassword(password1);

    const user = new User({
      provider: DEFAULT_PROVIDER,
      email: email,
      username: email,
      password: encryptedPassword,
      resetPasswordToken: null,
      resetPasswordExpiration: null,
      lastLogin: null,
    });

    const result = await user.save();

    if (!result) {
      throw HttpError.INTERNAL_SERVER_ERROR({
        message: "There was a problem while updating the DB",
      });
    }

    // TODO: Figure out email validation
    // const postValidationLink = `${
    //   data.postValidationBaseLink
    // }?d=${await userService.generateToken(data.email)}`;

    // await EmailService.to(data.email).sendSignUpEmail(
    //   data.username,
    //   postValidationLink
    // );

    res.status(204).send();
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
 * Validate captcha token
 */
router.post(
  "/verify-captcha",
  asyncMiddleware(async (req, res) => {
    /** @type {{token:string}} */
    const { token } = req.body;
    const result = await User.verifyCaptcha(token);

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
