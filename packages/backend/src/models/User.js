import { Schema, model } from "mongoose";
import axios from "axios";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import isEmail from "validator/lib/isEmail";
import isStrongPassword from "validator/lib/isStrongPassword";
import { EMAIL_REGEX } from "./Regex";
import { DashboardValidationError } from "./Exceptions";
import env from "environment";

const PASSWORD_MIN_LENGTH = 8;
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
export class PocketUser {
  /**
   * @param {string} provider Provider name.
   * @param {string} email Email of user.
   * @param {string} username Username of user.
   * @param {string} [password] Password.
   * @param {string} [resetPasswordToken] Reset password token.
   * @param {string} [resetPasswordExpiration] Reset password token expiration date.
   * @param {string} [lastLogin] Last login.
   * @param {string} [customerID] Customer ID.
   */
  constructor(
    provider,
    email,
    username,
    password,
    resetPasswordToken,
    resetPasswordExpiration,
    lastLogin,
    customerID
  ) {
    Object.assign(this, {
      provider: provider.toLowerCase(),
      email,
      username,
      password,
      resetPasswordToken,
      resetPasswordExpiration,
      lastLogin,
      customerID,
    });
  }

  /**
   * Factory type to create an user object.
   *
   * @param {PocketUser} user User to create.
   *
   * @returns {PocketUser} A new Pocket user.
   * @static
   */
  static createPocketUserWithUTCLastLogin(user) {
    const lastLoginUTC = new Date().toUTCString();

    return new PocketUser(
      user.provider,
      user.email,
      user.username,
      user.password,
      user.resetPasswordToken,
      user.resetPasswordExpiration,
      lastLoginUTC,
      user.customerID
    );
  }

  /**
   * Factory type to create an user object from db.
   *
   * @param {object} user User from db.
   * @param {string} user.provider Provider.
   * @param {string} user.email Email.
   * @param {string} user.username User name.
   * @param {string} user.password Password.
   * @param {string} user.lastLogin Last login.
   * @param {string} user.customerID Customer ID.
   *
   * @returns {PocketUser} A new Pocket user.
   * @static
   */
  static createPocketUserFromDB(user) {
    return new PocketUser(
      user.provider,
      user.email,
      user.username,
      user.password,
      user.resetPasswordToken,
      user.resetPasswordExpiration,
      user.lastLogin,
      user.customerID
    );
  }

  /**
   * Remove sensitive fields from user.
   *
   * @param {PocketUser} pocketUser Pocket user to remove fields.
   *
   * @returns {PocketUser} A new Pocket user.
   * @static
   */
  static removeSensitiveFields(pocketUser) {
    let user = new PocketUser(
      pocketUser.provider,
      pocketUser.email,
      pocketUser.username
    );

    user.customerID = pocketUser.customerID;

    return user;
  }
}
export class EmailUser extends PocketUser {
  /**
   * @param {string} email Email of user.
   * @param {string} username Username of user.
   * @param {string} password Password of user.
   */
  constructor(email, username, password) {
    super("email", email, username, password);
  }

  /**
   * Validate user data.
   *
   * @param {object} userData User data to validate.
   * @param {string} userData.email Email of user.
   * @param {string} userData.username Username of user.
   * @param {string} userData.password1 Password of user.
   * @param {string} userData.password2 Password to validate against Password1.
   *
   * @returns {boolean} If is validation success
   * @throws {DashboardValidationError} If validation fails
   * @static
   */
  static validate(userData) {
    EmailUser.validateEmail(userData.email);

    EmailUser.validateUsername(userData.username);

    EmailUser.validatePasswords(userData.password1, userData.password2);

    return true;
  }

  /**
   * Validate passwords.
   *
   * @param {string} password1 Password to validate against password2.
   * @param {string} password2 Password to validate against password1.
   *
   * @returns {boolean} If passwords match or not.
   * @throws {DashboardValidationError} If validation fails.
   */
  static validatePasswords(password1, password2) {
    if (
      password1.length < PASSWORD_MIN_LENGTH ||
      password2.length < PASSWORD_MIN_LENGTH
    ) {
      throw new DashboardValidationError(
        `Passwords must have ${PASSWORD_MIN_LENGTH} characters at least.`
      );
    }

    if (password1 !== password2) {
      throw new DashboardValidationError("Passwords does not match.");
    }

    return true;
  }

  /**
   * Validate user name.
   *
   * @param {string} username User name.
   *
   * @returns {boolean} If is valid
   * @throws {DashboardValidationError} if validation fails.
   */
  static validateUsername(username) {
    if (username === "") {
      throw new DashboardValidationError("Username is not valid.");
    }

    return true;
  }

  /**
   * Validate email.
   *
   * @param {string} email User email.
   *
   * @returns {boolean} If is valid
   * @throws {DashboardValidationError} if validation fails.
   */
  static validateEmail(email) {
    if (!EMAIL_REGEX.test(email)) {
      throw new DashboardValidationError("Email address is not valid.");
    }

    return true;
  }

  /**
   * Factory method to create an Email user with encrypted password.
   *
   * @param {string} email Email.
   * @param {string} username Username.
   * @param {string} password Password.
   *
   * @returns {Promise<PocketUser>} A new Email user.
   * @static
   * @async
   */
  static async createEmailUserWithEncryptedPassword(email, username, password) {
    const encryptedPassword = await EmailUser.encryptPassword(password);

    return new EmailUser(email, username, encryptedPassword);
  }

  /**
   * Factory type to encrypt a password.
   *
   * @param {string} password Password to encrypt.
   *
   * @returns {Promise<string>} An encrypted password.
   * @static
   * @async
   */
  static async encryptPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  /**
   * Compare passwords.
   *
   * @param {string} plainPassword Password unencrypted.
   * @param {string} userPassword Encrypted user password.
   *
   * @returns {Promise<boolean>} If plainPassword matches against userPassword.
   * @static
   * @async
   */
  static async validatePassword(plainPassword, userPassword) {
    return await bcrypt.compare(plainPassword, userPassword);
  }
}
