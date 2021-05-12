import express from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import asyncMiddleware from "middlewares/async";
import { authenticate } from "middlewares/passport-auth";
import Token, { TOKEN_TYPES } from "models/Token";
import User from "models/User";
import HttpError from "errors/http-error";
import passport from "lib/passport-local";
import MailgunService from "services/MailgunService";
import env from "environment";

const SALT_ROUNDS = 10;
const TEN_DAYS = 10 * 24 * 60 * 60 * 1000;

const router = express.Router();

function createCookieFromToken(user, statusCode, req, res) {
  const token = user.generateVerificationToken();

  const cookieOptions = {
    // Expires in 10 days
    expires: new Date(Date.now() + TEN_DAYS),
    httpOnly: true,
    sameSite: "none",
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

function destroyCookie(user, req, res) {
  const token = user.generateVerificationToken();

  const cookieOptions = {
    // Expires in 10 days
    expires: new Date(Date.now() - TEN_DAYS),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };

  res.cookie("jwt", token, cookieOptions);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
}

async function createNewVerificationToken(userId, userEmail) {
  const staleToken = await Token.findOne({ userId });

  if (staleToken) {
    await staleToken.deleteOne();
  }

  const validationToken = crypto.randomBytes(32).toString("hex");
  const hashedValidationToken = await bcrypt.hash(validationToken, SALT_ROUNDS);

  const userValidationToken = new Token({
    userId: userId,
    email: userEmail,
    token: hashedValidationToken,
    type: TOKEN_TYPES.verification,
    createdAt: Date.now(),
  });

  await userValidationToken.save();

  return validationToken;
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
          return next(err);
        }

        if (!user) {
          return next(
            HttpError.BAD_REQUEST({
              errors: [
                {
                  id: "INVALID_CREDENTIALS",
                  message: "Wrong email or password",
                },
              ],
            })
          );
        }

        if (!user.validated) {
          const validationToken = await createNewVerificationToken(
            user._id,
            user.email
          );

          const validationLink = `${env(
            "FRONTEND_URL"
          )}/#/validate?token=${validationToken}&email=${encodeURIComponent(
            user.email
          )}`;

          const emailService = new MailgunService();

          await emailService.send({
            templateName: "SignUp",
            toEmail: user.email,
            templateData: {
              user_email: user.email,
              verify_link: validationLink,
            },
          });

          return next(
            HttpError.BAD_REQUEST({
              errors: [
                { id: "NOT_VALIDATED", message: "Please verify your email" },
              ],
            })
          );
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
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(
          HttpError.BAD_REQUEST({
            message: "There was an error while creating your account",
          })
        );
      }

      const validationToken = await createNewVerificationToken(
        user._id,
        user.email
      );

      const validationLink = `${env(
        "FRONTEND_URL"
      )}/#/validate?token=${validationToken}&email=${encodeURIComponent(
        user.email
      )}`;

      const emailService = new MailgunService();

      await emailService.send({
        templateName: "SignUp",
        toEmail: user.email,
        templateData: {
          user_email: user.email,
          verify_link: validationLink,
        },
      });

      return res.status(204).send();
    })(req, res, next);
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
  "/send-reset-email",
  asyncMiddleware(async (req, res) => {
    const { email } = req.body;

    const processedEmail = email;

    const user = await User.findOne({ email: processedEmail });

    if (!user) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: "EMAIL_DOES_NOT_EXIST", message: "Email does not exist" },
        ],
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedResetToken = await bcrypt.hash(resetToken, SALT_ROUNDS);

    const userResetToken = new Token({
      userId: user._id,
      email: processedEmail,
      token: hashedResetToken,
      type: TOKEN_TYPES.reset,
      createdAt: Date.now(),
    });

    await userResetToken.save();
    const resetLink = `${env(
      "FRONTEND_URL"
    )}/#/newpassword?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`;

    const emailService = new MailgunService();

    try {
      await emailService.send({
        templateName: "PasswordReset",
        toEmail: user.email,
        templateData: {
          user_email: user.email,
          reset_link: resetLink,
        },
      });
    } catch (err) {
      console.log(err);
    }
    return res.status(204).send();
  })
);

router.post(
  "/reset-password",
  asyncMiddleware(async (req, res) => {
    const { plainToken, password1, password2, email } = req.body;

    if (!plainToken || !password1 || !password2 || !email) {
      throw HttpError.BAD_REQUEST({
        message: "Missing required fields in body",
      });
    }

    const isPasswordValid = await User.validatePassword(password1);
    const processedEmail = email;

    if (!isPasswordValid) {
      throw HttpError.BAD_REQUEST({
        errors: [{ message: "Password is not secure enough" }],
      });
    }

    if (password1 !== password2) {
      throw HttpError.BAD_REQUEST({
        errors: [{ message: "Passwords don't match" }],
      });
    }

    const storedToken = await Token.findOne({
      $and: [{ email: processedEmail }, { type: TOKEN_TYPES.reset }],
    });

    if (!storedToken) {
      throw HttpError.BAD_REQUEST({
        errors: [{ message: "Token has expired" }],
      });
    }

    const isTokenMatching = await bcrypt.compare(plainToken, storedToken.token);

    if (!isTokenMatching) {
      throw HttpError.BAD_REQUEST({
        errors: [{ message: "Token is not matching" }],
      });
    }

    const newHashedPassword = await bcrypt.hash(password1, SALT_ROUNDS);

    await User.updateOne(
      {
        email: processedEmail,
      },
      { $set: { password: newHashedPassword } },
      { new: true }
    );

    await storedToken.deleteOne();

    res.status(204).send();
  })
);

router.post(
  "/validate-user",
  asyncMiddleware(async (req, res) => {
    const { plainToken, email } = req.body;

    if (!plainToken || !email) {
      throw HttpError.BAD_REQUEST({
        errors: [{ id: "MISSING_FIELDS", message: "Invalid request" }],
      });
    }

    const processedEmail = decodeURIComponent(email);

    const storedToken = await Token.findOne({
      $and: [{ email: processedEmail }, { type: TOKEN_TYPES.verification }],
    });

    if (!storedToken) {
      throw HttpError.BAD_REQUEST({
        errors: [{ id: "EXPIRED_TOKEN", message: "Token has expired" }],
      });
    }

    const isTokenMatching = await bcrypt.compare(plainToken, storedToken.token);

    if (!isTokenMatching) {
      throw HttpError.BAD_REQUEST({
        errors: [{ id: "INVALID_TOKEN", message: "Token is invalid" }],
      });
    }

    await User.updateOne(
      {
        email: processedEmail,
      },
      { $set: { validated: true } },
      { new: true }
    );

    await storedToken.deleteOne();

    res.status(204).send();
  })
);

router.use(authenticate);

router.post(
  "/logout",
  asyncMiddleware(async (req, res) => {
    const user = await User.findById(req.user._id);

    destroyCookie(user, req, res);
  })
);

export default router;
