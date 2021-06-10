import { Schema, model, Model, Document } from 'mongoose'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
import isEmail from 'validator/lib/isEmail'
import isStrongPassword from 'validator/lib/isStrongPassword'
import env, { AuthKeys } from '../environment'

dotenv.config()

const SALT_ROUNDS = 10

export interface IUser extends Document {
  provider?: string
  email: string
  username: string
  password: string
  lastLogin: string
  validated: boolean
  v2: boolean
  comparePassword: (plainPassword: string, userPassword: string) => boolean
  encryptPassword: (password: string) => string
  generateVerificationToken: () => string
  validateEmail: (email: string) => string
  validatePassword: (password: string) => string
}

const userSchema = new Schema<IUser>(
  {
    provider: String,
    email: String,
    username: String,
    password: String,
    lastLogin: String,
    validated: Boolean,
    v2: Boolean,
  },
  { collection: 'Users' }
)

userSchema.statics.validateEmail = function validateEmail(email) {
  return isEmail(email)
}
userSchema.statics.validatePassword = function validatePassword(password) {
  return isStrongPassword(password)
}
userSchema.statics.encryptPassword = function encryptPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}
userSchema.statics.comparePassword = function comparePassword(
  plainPassword,
  userPassword
) {
  return bcrypt.compare(plainPassword, userPassword)
}
userSchema.methods.generateVerificationToken = function generateVerificationToken() {
  const token = jwt.sign(
    { id: this._id },
    (env('AUTH') as AuthKeys).privateSecret,
    {
      expiresIn: '10d',
      algorithm: 'RS256',
    }
  )

  return token
}
userSchema.methods.comparePassword = function comparePassword(
  password: string
) {
  return bcrypt.compare(password, (this as IUser).password)
}
const User: Model<IUser> = model('User', userSchema)

export default User
