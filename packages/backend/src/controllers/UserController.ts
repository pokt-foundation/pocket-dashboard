import express, {
  Response,
  Request,
  NextFunction,
  CookieOptions,
} from 'express'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { Types } from 'mongoose'
import asyncMiddleware from '../middlewares/async'
import { authenticate } from '../middlewares/passport-auth'
import Token, { TOKEN_TYPES } from '../models/Token'
import User, { IUser } from '../models/User'
import HttpError from '../errors/http-error'
import passport from '../lib/passport-local'
import MailgunService from '../services/MailgunService'
import env from '../environment'

const SALT_ROUNDS = 10
const TEN_DAYS = 10 * 24 * 60 * 60 * 1000
const router = express.Router()

function createCookieFromToken(
  user: IUser,
  statusCode: number,
  req: Request,
  res: Response
) {
  const token = user.generateVerificationToken()
  const cookieOptions: CookieOptions = {
    // Expires in 10 days
    expires: new Date(Date.now() + TEN_DAYS),
    httpOnly: true,
    sameSite: 'none',
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  }

  res.cookie('jwt', token, cookieOptions)
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

function destroyCookie(user: IUser, req: Request, res: Response) {
  const token = user.generateVerificationToken()
  const cookieOptions = {
    // Expires in 10 days
    expires: new Date(Date.now() - TEN_DAYS),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  }

  res.cookie('jwt', token, cookieOptions)
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  })
}

async function createNewVerificationToken(
  userId: Types.ObjectId,
  userEmail: string
) {
  const staleToken = await Token.findOne({ userId })

  if (staleToken) {
    await staleToken.deleteOne()
  }
  const validationToken = crypto.randomBytes(32).toString('hex')
  const hashedValidationToken = await bcrypt.hash(validationToken, SALT_ROUNDS)
  const userValidationToken = new Token({
    userId: userId,
    email: userEmail,
    token: hashedValidationToken,
    type: TOKEN_TYPES.verification,
    createdAt: Date.now(),
  })

  await userValidationToken.save()
  return validationToken
}

/**
 * User authentication using username and password.
 */
router.post(
  '/login',
  asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate(
      'login',
      { session: false },
      async (err, user: IUser) => {
        if (err) {
          next(err)
        }
        if (!user) {
          next(
            HttpError.BAD_REQUEST({
              errors: [
                {
                  id: 'INVALID_CREDENTIALS',
                  message: 'Wrong email or password',
                },
              ],
            })
          )
        }

        if (!user.validated) {
          const validationToken = await createNewVerificationToken(
            user._id,
            user.email
          )
          const validationLink = `${env(
            'FRONTEND_URL'
          )}/#/validate?token=${validationToken}&email=${encodeURIComponent(
            user.email
          )}`
          const emailService = new MailgunService()

          await emailService.send({
            templateData: {
              user_email: user.email,
              verify_link: validationLink,
            },
            templateName: 'SignUp',
            toEmail: user.email,
          })
          next(
            HttpError.BAD_REQUEST({
              errors: [
                {
                  id: 'NOT_VALIDATED',
                  message: 'Please verify your email. Check your inbox!',
                },
              ],
            })
          )
        }

        createCookieFromToken(user, 200, req, res)
      }
    )(req, res, next)
  })
)

/**
 * User sign up using email.
 */
router.post(
  '/signup',
  asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('signup', { session: false }, async (err, user) => {
      if (err) {
        next(err)
      }
      if (!user) {
        next(
          HttpError.INTERNAL_SERVER_ERROR({
            errors: [
              {
                id: 'CREATION_ERROR',
                message: 'There was an error while creating your account',
              },
            ],
          })
        )
      }
      const validationToken = await createNewVerificationToken(
        user._id,
        user.email
      )
      const validationLink = `${env(
        'FRONTEND_URL'
      )}/#/validate?token=${validationToken}&email=${encodeURIComponent(
        user.email
      )}`
      const emailService = new MailgunService()

      await emailService.send({
        templateData: {
          user_email: user.email,
          verify_link: validationLink,
        },
        templateName: 'SignUp',
        toEmail: user.email,
      })
      return res.status(204).send()
    })(req, res, next)
  })
)

router.post(
  '/send-verify-mail',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { email } = req.body
    const user: IUser = await User.findOne({ email })

    if (!user) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'EMAIL_DOES_NOT_EXIST', message: 'Email does not exist' },
        ],
      })
    }
    const validationToken = await createNewVerificationToken(
      user._id,
      user.email
    )
    const validationLink = `${env(
      'FRONTEND_URL'
    )}/#/validate?token=${validationToken}&email=${encodeURIComponent(
      user.email
    )}`
    const emailService = new MailgunService()

    await emailService.send({
      templateData: {
        user_email: user.email,
        verify_link: validationLink,
      },
      templateName: 'SignUp',
      toEmail: user.email,
    })
    return res.status(204).send()
  })
)

router.post(
  '/send-reset-email',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { email } = req.body
    const processedEmail = email
    const user: IUser = await User.findOne({ email: processedEmail })

    if (!user) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'EMAIL_DOES_NOT_EXIST', message: 'Email does not exist' },
        ],
      })
    }
    const resetToken = crypto.randomBytes(32).toString('hex')
    const hashedResetToken = await bcrypt.hash(resetToken, SALT_ROUNDS)
    const userResetToken = new Token({
      userId: user._id,
      email: processedEmail,
      token: hashedResetToken,
      type: TOKEN_TYPES.reset,
      createdAt: Date.now(),
    })

    await userResetToken.save()
    const resetLink = `${env(
      'FRONTEND_URL'
    )}/#/newpassword?token=${resetToken}&email=${encodeURIComponent(
      user.email
    )}`
    const emailService = new MailgunService()

    try {
      await emailService.send({
        templateData: {
          user_email: user.email,
          reset_link: resetLink,
        },
        templateName: 'PasswordReset',
        toEmail: user.email,
      })
    } catch (err) {
      console.log(err)
    }
    return res.status(204).send()
  })
)

router.post(
  '/reset-password',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { plainToken, password1, password2, email } = req.body

    if (!plainToken || !password1 || !password2 || !email) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'MISSING_FIELDS',
            message: 'Missing required fields in body',
          },
        ],
      })
    }

    // @ts-ignore
    const isPasswordValid = await User.validatePassword(password1)
    const processedEmail = email

    if (!isPasswordValid) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'NOT_SECURE_PASSWORD',
            message: 'Password is not secure enough',
          },
        ],
      })
    }
    if (password1 !== password2) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'NON_MATCHING_PASSWORDS', message: "Passwords don't match" },
        ],
      })
    }

    const storedToken = await Token.findOne({
      $and: [{ email: processedEmail }, { type: 'TOKEN_RESET' }],
    })

    if (!storedToken) {
      throw HttpError.BAD_REQUEST({
        errors: [{ id: 'EXPIRED_TOKEN', message: 'Token has expired' }],
      })
    }
    const isTokenMatching = await bcrypt.compare(plainToken, storedToken.token)

    if (!isTokenMatching) {
      throw HttpError.BAD_REQUEST({
        errors: [
          { id: 'NON_MATCHING_TOKEN', message: 'Token is not matching' },
        ],
      })
    }
    const newHashedPassword = await bcrypt.hash(password1, SALT_ROUNDS)

    await User.updateOne(
      {
        email: processedEmail,
      },
      { $set: { password: newHashedPassword } },
      { new: true }
    )
    await storedToken.deleteOne()
    res.status(204).send()
  })
)

router.post(
  '/validate-user',
  asyncMiddleware(async (req: Request, res: Response) => {
    const { plainToken, email } = req.body

    const user = await User.findOne({ email })

    if (!plainToken || !email || !user) {
      throw HttpError.BAD_REQUEST({
        errors: [{ id: 'MISSING_FIELDS', message: 'Invalid request' }],
      })
    }

    const processedEmail = decodeURIComponent(email)
    const storedTokens = await Token.find({
      $and: [{ email: processedEmail }, { type: 'TOKEN_VERIFICATION' }],
    })

    if (!storedTokens.length) {
      const validationToken = await createNewVerificationToken(
        user._id,
        user.email
      )
      const emailService = new MailgunService()
      const validationLink = `${env(
        'FRONTEND_URL'
      )}/#/validate?token=${validationToken}&email=${encodeURIComponent(
        user.email
      )}`

      await emailService.send({
        templateData: {
          user_email: user.email,
          verify_link: validationLink,
        },
        templateName: 'SignUp',
        toEmail: user.email,
      })
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'EXPIRED_TOKEN',
            message:
              'Your verification token has expired. We have sent a new one to your email.',
          },
        ],
      })
    }

    const tokenMatches = await Promise.all(
      storedTokens.map(
        async (storedToken) =>
          await bcrypt.compare(plainToken, storedToken.token)
      )
    )

    const isTokenMatching = tokenMatches.reduce(
      (valid, matches) => valid || matches,
      false
    )

    if (!isTokenMatching) {
      throw HttpError.BAD_REQUEST({
        errors: [
          {
            id: 'INVALID_TOKEN',
            message:
              'Your verification token seems to be invalid. Did you use the latest email we sent?',
          },
        ],
      })
    }
    await User.updateOne(
      {
        email: processedEmail,
      },
      { $set: { validated: true } },
      { new: true }
    )
    await Promise.all(
      storedTokens.map(async (storedToken) => await storedToken.deleteOne())
    )

    res.status(204).send()
  })
)

router.use(authenticate)

router.post(
  '/logout',
  asyncMiddleware(async (req: Request, res: Response) => {
    const user = await User.findById((req.user as IUser)._id)

    destroyCookie(user, req, res)
  })
)
export default router
