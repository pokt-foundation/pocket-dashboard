import express from "express";
import asyncMiddleware from "middlewares/async";
import EmailService from "services/EmailService";
import User from "models/User";
import HttpError from "errors/http-error";

const DEFAULT_PROVIDER = "EMAIL";

const router = express.Router();

/**
 * Check if user exists.
 */
router.post(
  "/exists",
  asyncMiddleware(async (req, res) => {
    /** @type {{email:string, authProvider: string}} */
    const { email } = req.body;

    const exists = await User.exists({ email });

    res.status(200).send({ exists });
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

    const isOldUser = user.v2;

    if (isOldUser) {
      throw HttpError.BAD_REQUEST({
        message: "Sign ins with old users is not allowed.",
      });
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
    const { email, password1, password2, postValidationBaseLink = "" } = data;

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
      v2: true,
    });

    const result = await user.save();

    if (!result) {
      throw HttpError.INTERNAL_SERVER_ERROR({
        message: "There was a problem while updating the DB",
      });
    }

    // TODO: Figure out email validation
    const postValidationLink = `${postValidationBaseLink}?d=${await User.generateToken(
      data.email
    )}`;

    await EmailService.to(data.email).sendSignUpEmail(
      data.username,
      postValidationLink
    );

    res.status(204).send();
  })
);

/**
 * Check if user is validated.
 */
router.post(
  "/is-validated",
  asyncMiddleware(async (req, res) => {
    const { email } = req.body;

    const { verified } = await User.findOne({ email });

    res.status(200).send({ verified });
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
