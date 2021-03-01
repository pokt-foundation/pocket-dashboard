import { Schema, model } from "mongoose";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import isEmail from "validator/lib/isEmail";
import isStrongPassword from "validator/lib/isStrongPassword";
import env from "environment";

const SALT_ROUNDS = 10;

const userSchema = new Schema(
  {
    provider: String,
    email: String,
    username: String,
    password: String,
    resetPasswordExpiration: String,
    resetPasswordToken: String,
    lastLogin: String,
    validated: Boolean,
    v2: Boolean,
  },
  { collection: "Users" }
);

userSchema.statics.validateEmail = function validateEmail(email) {
  return isEmail(email);
};

userSchema.statics.validatePassword = function validatePassword(password) {
  return isStrongPassword(password);
};

userSchema.statics.encryptPassword = function encryptPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
};

userSchema.statics.comparePassword = function comparePassword(
  plainPassword,
  userPassword
) {
  return bcrypt.compare(plainPassword, userPassword);
};

userSchema.statics.verifyCaptcha = function verifyCaptcha(token) {
  const secret = env("recaptcha").google_server;

  /**
   * Although is a POST request, google requires the data to be sent by query
   * params, trying to do so in the body will result on an error.
   */
  return axios.post(
    `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
  );
};

userSchema.statics.generateToken = function generateToken(email) {
  const payload = { email };

  return jwt.sign(payload, env("auth").secret_key);
};

userSchema.statics.generateNewSessionTokens = function generateNewSessionTokens(
  userId,
  userEmail
) {
  const payload = { id: userId, email: userEmail };

  const accessToken = jwt.sign(
    {
      data: payload,
    },
    env("auth").secret_key,
    { expiresIn: env("auth").expiration }
  );

  const refreshToken = jwt.sign(
    {
      data: payload,
    },
    env("auth").secret_key,
    { expiresIn: env("auth").refresh_expiration }
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

const User = model("User", userSchema);

export default User;
