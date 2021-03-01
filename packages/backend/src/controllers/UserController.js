import express from "express";
import asyncMiddleware from "middlewares/async";
import { authenticate } from "middlewares/passport-auth";
import EmailService from "services/EmailService";
import Token, { TOKEN_TYPES } from "models/Token";
import User from "models/User";
import HttpError from "errors/http-error";
import passport from "lib/passport-local";

const DEFAULT_PROVIDER = "EMAIL";

const router = express.Router();

function createCookieFromToken(user, statusCode, req, res) {
  const token = user.generateVerificationToken();

  const cookieOptions = {
    // Expires in 10 days
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}

/**
 * User authentication using username and password.
 */
router.post(
  "/login",
  asyncMiddleware(async (req, res, next) => {
    passport.authenticate(
      "login",
      // As we're using an API which requires a token for each request,
      // we don't need to save a session in the server
      { session: false },
      async (err, user) => {
        if (err) {
          throw HttpError.BAD_REQUEST(err);
        }

        if (!user) {
          throw HttpError.BAD_REQUEST({
            status: "error",
            meessage: "Incorrect email or password",
          });
        }
        createCookieFromToken(user, 200, req, res);
      }
    )(req, res, next);
  })
);

/**
 * User sign up using email.
 */
router.post(
  "/signup",
  asyncMiddleware(async (req, res, next) => {
    passport.authenticate("signup", { session: false }, async (err, user) => {
      console.log("alo");
      if (err) {
        throw HttpError.BAD_REQUEST(err);
      }

      if (!user) {
        throw HttpError.BAD_REQUEST({
          status: "error",
          meessage: "Incorrect email or password",
        });
      }
      createCookieFromToken(user, 200, req, res);
    })(req, res, next);
  })
);

/**
 * Check if user is validated.
 */
router.post(
  "/is-validated",
  asyncMiddleware(async (req, res) => {
    const { email } = req.body;

    const { verified = false } = await User.findOne({ email });

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

router.post(
  "/send-signup-email",
  asyncMiddleware(async (req, res) => {
    const { email, validationRoute } = req.body;

    // TODO: Make validation token
  })
);

router.use(authenticate);

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
