import BaseService from "./BaseService";
import { EmailUser, PocketUser } from "../models/User";
import { AnsweredSecurityQuestion } from "../models/AnsweredSecurityQuestion";
import { SecurityQuestion } from "../models/SecurityQuestion";
import env from "environment";
import jwt from "jsonwebtoken";
import axios from "axios";
import { DashboardError, DashboardValidationError } from "../models/Exceptions";

const USER_COLLECTION_NAME = "Users";

export default class UserService extends BaseService {
  constructor() {
    super();
  }

  /**
   * Persist user if not exists at Pocket database.
   *
   * @param {PocketUser} user User to create on database.
   *
   * @returns {Promise<boolean>} If user was created or not.
   * @private
   * @async
   */
  async __persistUserIfNotExists(user) {
    if (!(await this.userExists(user.email))) {
      /** @type {{result: {n:number, ok: number}}} */
      const result = await this.persistenceService.saveEntity(
        USER_COLLECTION_NAME,
        user
      );

      return result.result.ok === 1;
    }
    return false;
  }

  /**
   * Update last login of user.
   *
   * @param {PocketUser} user User to update last login.
   *
   * @private
   * @async
   */
  async __updateLastLogin(user) {
    const userToUpdate = PocketUser.createPocketUserWithUTCLastLogin(user);

    await this.persistenceService.updateEntity(
      USER_COLLECTION_NAME,
      { email: user.email },
      userToUpdate
    );
  }

  /**
   * Get user from DB.
   *
   * @param {string} userEmail User email.
   * @param {string} [provider] Filter by provider.
   *
   * @returns {Promise<*>} User data.
   * @private
   * @async
   */
  async __getUser(userEmail, provider = "email") {
    const filter = {
      email: userEmail,
      provider,
    };

    return await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );
  }

  /**
   * Check if user exists on DB.
   *
   * @param {string} userEmail User email to check if exists.
   * @param {string} [authProvider] User auth provider type.
   *
   * @returns {Promise<boolean>} If user exists or not.
   * @async
   */
  async userExists(userEmail, authProvider = undefined) {
    let filter = { email: userEmail };

    if (authProvider) {
      filter["provider"] = authProvider;
    }

    const dbUser = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    return dbUser !== undefined;
  }

  /**
   * Check if user is validated on DB.
   *
   * @param {string} userEmail User email to check if is validated.
   * @param {string} [authProvider] User auth provider type.
   *
   * @returns {Promise<boolean>} If user is validated or not.
   * @async
   */
  async isUserValidated(userEmail, authProvider = undefined) {
    let filter = {
      email: userEmail,
      securityQuestions: { $ne: null },
    };

    if (authProvider) {
      filter["provider"] = authProvider;
    }

    const dbUser = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    return dbUser !== undefined;
  }

  /**
   * Get User from DB.
   *
   * @param {string} email User email.
   *
   * @returns {Promise<PocketUser>} Pocket user.
   * @async
   */
  async getUser(email) {
    const filter = { email };
    const dbUser = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    return PocketUser.removeSensitiveFields(
      PocketUser.createPocketUserFromDB(dbUser)
    );
  }

  /**
   * Get customer ID from user.
   *
   * @param {string} userEmail User email.
   *
   * @returns {Promise<string>} The customer ID of user.
   */
  async getUserCustomerID(userEmail) {
    const user = await this.getUser(userEmail);

    return user.customerID;
  }

  /**
   * Save customer ID
   *
   * @param {string} userEmail User email.
   * @param {string} userCustomerID Customer ID.
   *
   * @returns {Promise<boolean>} If was saved or not.
   */
  async saveCustomerID(userEmail, userCustomerID) {
    const filter = { email: userEmail };
    const dbUser = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    dbUser.customerID = userCustomerID;

    /** @type {{result: {n:number, ok: number}}} */
    const result = await this.persistenceService.updateEntityByID(
      USER_COLLECTION_NAME,
      dbUser._id,
      dbUser
    );

    return result.result.ok === 1;
  }

  /**
   * Get consent provider Auth urls.
   *
   * @returns {{name:string, consent_url:string}[]} The consent url for all Auth provider available.
   */
  getConsentProviderUrls() {
    const result = this.__authProviders.map((provider) => {
      return {
        name: provider.name,
        consent_url: provider.getConsentURL(),
      };
    });

    return result;
  }

  /**
   * Authenticate user with email or username and password.
   *
   * @param {string} username Email or username of user.
   * @param {string} password Password of user to authenticate.
   *
   * @returns {Promise<PocketUser>} An authenticated pocket user.
   * @throws {DashboardError | DashboardValidationError} If username or password is invalid.
   * @async
   */
  async authenticateUser(username, password) {
    const filter = { $or: [{ username }, { email: username }] };
    const userDB = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    if (!userDB) {
      throw new DashboardError("Invalid username.");
    }
    // Retrieve the user from the db
    const pocketUser = PocketUser.createPocketUserFromDB(userDB);

    if (!pocketUser.password) {
      throw new DashboardValidationError("Password is invalid.");
    }

    // Check if password is correct
    const passwordValidated = await EmailUser.validatePassword(
      password,
      pocketUser.password
    );

    if (!passwordValidated) {
      throw new DashboardValidationError("Passwords do not match.");
    }

    // Access and refresh tokens generation
    const tokens = await this.generateNewSessionTokens(
      userDB._id,
      userDB.email
    );

    // Update last login of user on DB.
    await this.__updateLastLogin(pocketUser);

    const user = PocketUser.removeSensitiveFields(pocketUser);

    return {
      user: user,
      session: tokens,
    };
  }

  /**
   * Sign up a User.
   *
   * @param {object} userData User data to validate.
   * @param {string} userData.email Email of userData.
   * @param {string} userData.username Username of userData.
   * @param {string} userData.password1 Password of userData.
   * @param {string} userData.password2 Password to validate against Password1.
   *
   * @returns {Promise<boolean>} If user was created or not.
   * @throws {DashboardError} If validation fails or already exists.
   * @async
   */
  async signupUser(userData) {
    if (EmailUser.validate(userData)) {
      if (await this.userExists(userData.email)) {
        throw new DashboardError("This email is already registered");
      }

      const emailPocketUser = await EmailUser.createEmailUserWithEncryptedPassword(
        userData.email,
        userData.username,
        userData.password1
      );

      // Create the user if not exists on DB.
      return await this.__persistUserIfNotExists(emailPocketUser);
    }
  }

  /**
   * Logout user.
   *
   * @param {string} email Email of user.
   *
   * @returns {Promise<boolean>} If user was logout or not.
   * @async
   */
  async logout(email) {
    return true;
  }

  /**
   * Add or update answered security questions to user.
   *
   * @param {string} userEmail Email of user.
   * @param {Array<{question: string, answer:string}>} questions Questions to add or update.
   *
   * @returns {Promise<boolean>} If user record was updated or not.
   * @throws {DashboardValidationError} If user is invalid.
   * @async
   */
  async addOrUpdateUserSecurityQuestions(userEmail, questions) {
    const filter = { email: userEmail };
    const userDB = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    if (!userDB) {
      throw new DashboardValidationError("Invalid user.");
    }

    const data = {
      securityQuestions: AnsweredSecurityQuestion.createAnsweredSecurityQuestions(
        questions
      ),
    };
    /** @type {{result: {n:number, ok: number}}} */

    const result = await this.persistenceService.updateEntity(
      USER_COLLECTION_NAME,
      filter,
      data
    );

    return result.result.ok === 1;
  }

  /**
   * Get user security questions.
   *
   * @param {string} userEmail Email of user.
   *
   * @returns {Promise<SecurityQuestion[]>} User security questions.
   * @throws {DashboardValidationError} If user is invalid.
   * @async
   */
  async getUserSecurityQuestions(userEmail) {
    const filter = {
      email: userEmail,
      securityQuestions: { $ne: null },
    };
    const userDB = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    if (!userDB) {
      throw new DashboardValidationError("Invalid user.");
    }

    return SecurityQuestion.createSecurityQuestions(userDB.securityQuestions);
  }

  /**
   * Validate user security questions.
   *
   * @param {string} userEmail Email of user.
   * @param {{question: string, answer: string}[]} userAnswers User input answers.
   *
   * @returns {Promise<SecurityQuestion[]>} True or false if the answers are valid.
   * @throws {DashboardValidationError} If user is invalid.
   * @async
   */
  async validateUserSecurityQuestions(userEmail, userAnswers) {
    const filter = {
      email: userEmail,
      securityQuestions: { $ne: null },
    };
    const userDB = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    if (!userDB) {
      throw new DashboardValidationError("Invalid user.");
    }
    const isValid = await AnsweredSecurityQuestion.validateAnsweredSecurityQuestions(
      userDB,
      userAnswers
    );

    return isValid;
  }

  /**
   * Generate a password reset token and expiration date for user.
   *
   * @param {string} userEmail User's email to update password reset fields.
   *
   * @returns {Promise<boolean>} If token was generated or not.
   * @async
   */
  async generateResetPasswordToken(userEmail) {
    const filter = {
      email: userEmail,
    };
    const user = await this.persistenceService.getEntityByFilter(
      USER_COLLECTION_NAME,
      filter
    );

    // Generate the password reset token
    const resetPasswordToken = await this.generateToken(user.email);

    // Generate expiring date for the password reset token
    const actualDate = new Date();

    actualDate.setHours(actualDate.getHours() + 1);
    const expiringDate = actualDate.toUTCString();

    // Return the user with the latest information
    const userToUpdate = new PocketUser(
      user.provider,
      user.email,
      user.username,
      user.password,
      resetPasswordToken,
      expiringDate,
      user.lastLogin,
      user.securityQuestions,
      user.customerID
    );

    const result = await this.persistenceService.updateEntity(
      USER_COLLECTION_NAME,
      { email: user.email },
      userToUpdate
    );

    return result.result.ok === 1;
  }

  /**
   * Verify user password.
   *
   * @param {string} userEmail User email.
   * @param {string} password Password to verify.
   *
   * @returns {Promise<boolean>} If password was verify or not.
   * @throws {DashboardValidationError} If user is invalid.
   * @async
   */
  async verifyPassword(userEmail, password) {
    const userDB = await this.__getUser(userEmail);

    if (!userDB) {
      throw new DashboardValidationError("Invalid user.");
    }

    return EmailUser.validatePassword(password, userDB.password);
  }

  /**
   * Retrieves user password reset token.
   *
   * @param {string} userEmail Email of user.
   *
   * @returns {Promise<string>} Password reset token.
   * @throws {DashboardValidationError} If passwords validation fails or if user does not exists.
   * @async
   */
  async retrievePasswordResetToken(userEmail) {
    const userDB = await this.__getUser(userEmail);

    if (userDB.resetPasswordToken) {
      return userDB.resetPasswordToken;
    } else {
      throw new DashboardValidationError(
        "No reset password token is available."
      );
    }
  }

  /**
   * Verify password reset token
   *
   * @param {object} userDB User entry.
   * @param {string} providedToken User provided password reset token.
   *
   * @returns {Promise<boolean>} If password reset token was verify or not.
   * @throws {DashboardValidationError} If password reset token is invalid.
   * @async
   */
  async verifyPasswordResetToken(userDB, providedToken) {
    if (!userDB) {
      throw new DashboardValidationError("Invalid user.");
    }

    if (userDB.resetPasswordToken && userDB.resetPasswordExpiration) {
      // Compare both tokens
      if (providedToken === userDB.resetPasswordToken) {
        // Retrieve the dates
        const actualDate = Date.parse(new Date());
        const expirationDate = Date.parse(userDB.resetPasswordExpiration);

        const seconds = (expirationDate - actualDate) / 1000;
        const minutes = seconds / 60;

        // Check if the date diferences is bigger than 60 minutes(1 hour)
        if (minutes > 0) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  /**
   * Reset user's password.
   *
   * @param {string} userEmail Email of user.
   * @param {string} token Password reset token.
   * @param {string} password1 New password.
   * @param {string} password2 Password confirmation.
   *
   * @returns {Promise<boolean>} If password was changed or not.
   * @throws {DashboardValidationError} If passwords validation fails or if user does not exists.
   * @async
   */
  async resetPassword(userEmail, token, password1, password2) {
    const userDB = await this.__getUser(userEmail);

    if (this.verifyPasswordResetToken(userDB, token)) {
      if (EmailUser.validatePasswords(password1, password2)) {
        // Update the user password.
        userDB.password = await EmailUser.encryptPassword(password1);
        // Remove current token and expiration date
        userDB.resetPasswordToken = null;
        userDB.resetPasswordExpiration = null;

        /** @type {{result: {n:number, ok: number}}} */
        const result = await this.persistenceService.updateEntityByID(
          USER_COLLECTION_NAME,
          userDB._id,
          userDB
        );

        return result.result.ok === 1;
      } else {
        return false;
      }
    }
  }

  /**
   * Change user password.
   *
   * @param {string} userEmail Email of user.
   * @param {string} oldPassword Old password.
   * @param {string} password1 New password.
   * @param {string} password2 Password confirmation.
   *
   * @returns {Promise<boolean>} If password was changed or not.
   * @throws {DashboardValidationError} If passwords validation fails or if user does not exists.
   * @async
   */
  async changePassword(userEmail, oldPassword, password1, password2) {
    const userDB = await this.__getUser(userEmail);

    if (!userDB) {
      throw new DashboardValidationError("Invalid user.");
    }

    const isVerified = await this.verifyPassword(userEmail, oldPassword);

    if (isVerified) {
      if (EmailUser.validatePasswords(password1, password2)) {
        // Update the user password.
        userDB.password = await EmailUser.encryptPassword(password1);

        /** @type {{result: {n:number, ok: number}}} */
        const result = await this.persistenceService.updateEntityByID(
          USER_COLLECTION_NAME,
          userDB._id,
          userDB
        );

        return result.result.ok === 1;
      } else {
        throw new DashboardValidationError(
          "New password doesn't match the confirm password."
        );
      }
    } else {
      throw new DashboardValidationError("Failed to validate old password.");
    }
  }

  /**
   * Change user name.
   *
   * @param {string} userEmail User email.
   * @param {string} username New user name.
   *
   * @returns {Promise<boolean>} If was changed or not.
   * @throws {DashboardValidationError} If validation fails or user does not exists.
   * @async
   */
  async changeUsername(userEmail, username) {
    if (EmailUser.validateUsername(username)) {
      const userDB = await this.__getUser(userEmail);

      if (!userDB) {
        throw new DashboardValidationError("Invalid user.");
      }

      // Update the username.
      userDB.username = username;

      /** @type {{result: {n:number, ok: number}}} */
      const result = await this.persistenceService.updateEntityByID(
        USER_COLLECTION_NAME,
        userDB._id,
        userDB
      );

      return result.result.ok === 1;
    }
  }

  /**
   * Change user email.
   *
   * @param {string} userEmail Current user email.
   * @param {string} newEmail New user email.
   *
   * @returns {Promise<boolean>} If was changed or not.
   * @throws {DashboardValidationError} If validation fails or user does not exists.
   * @async
   */
  async changeEmail(userEmail, newEmail) {
    if (EmailUser.validateEmail(newEmail)) {
      const userDB = await this.__getUser(userEmail);

      if (!userDB) {
        throw new DashboardValidationError("Invalid user.");
      }

      // Update the user email.
      userDB.email = newEmail;

      /** @type {{result: {n:number, ok: number}}} */
      const result = await this.persistenceService.updateEntityByID(
        USER_COLLECTION_NAME,
        userDB._id,
        userDB
      );

      return result.result.ok === 1;
    }
  }

  /**
   * Renew Session tokens using a valid refresh token.
   *
   * @param {string} token Refresh token.
   * @param {string} userEmail User email.
   *
   * @returns {Promise<{token: string, refreshToken: string}>} The Session tokens generated.
   * @async
   */
  async renewSessionTokens(token, userEmail) {
    const payload = await this.decodeToken(token, true);

    if (payload instanceof DashboardValidationError) {
      return payload;
    }
    // Validate if the account belongs to the client
    if (payload.email !== userEmail) {
      return new DashboardValidationError(
        "Failed to renew session, client email doesn't match the token payload email."
      );
    }

    // Check if the user exists in the DB
    const userDB = await this.__getUser(payload.email);

    if (userDB) {
      const userId = userDB._id.toString();
      const id = payload.id.toString();

      if (userId === id) {
        // Return the new session tokens
        return await this.generateNewSessionTokens(id, payload.email);
      } else {
        return new DashboardValidationError(
          "Failed to renew session, provided information doesn't match database."
        );
      }
    } else {
      return new DashboardValidationError(
        "Failed to renew session, no user exists for the provided email."
      );
    }
  }

  /**
   * Generate Session tokens.
   *
   * @param {string} userId User identifier.
   * @param {string} userEmail User Email.
   *
   * @returns {Promise<{token: string, refreshToken: string}>} Sessions generated tokens.
   * @async
   */
  async generateNewSessionTokens(userId, userEmail) {
    const payload = { id: userId, email: userEmail };

    // Access token
    const accessToken = jwt.sign(
      {
        data: payload,
      },
      env("auth").secret_key,
      { expiresIn: env("auth").expiration }
    );

    // Refresh token
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
  }

  /**
   * Generate token encapsulating the user email.
   *
   * @param {string} userEmail User email to encapsulate.
   *
   * @returns {Promise<string>} The token generated.
   * @async
   */
  async generateToken(userEmail) {
    const payload = { email: userEmail };

    return jwt.sign(payload, env("auth").secret_key);
  }

  /**
   * Verify if the session token belongs to the client email account.
   *
   * @param {object} authHeader Authorization header object.
   * @param {string} userEmail Email provided by the client.
   *
   * @returns {Promise<boolean>} True or false.
   * @async
   */
  async verifySessionForClient(authHeader, userEmail) {
    const accessToken = authHeader.split(", ")[0].split(" ")[1];
    const email = authHeader.split(", ")[2].split(" ")[1];
    const clientEmail = userEmail || email;

    const payload = await this.decodeToken(accessToken, true);

    if (payload instanceof DashboardValidationError) {
      return false;
    }

    if (payload.email === email && clientEmail === email) {
      return true;
    }

    return false;
  }

  /**
   * Decode a token.
   *
   * @param {string} token Token to decode.
   * @param {boolean} ignoreExpiration True if the expiration date should be ignored or false if not.
   *
   * @returns {object | DashboardValidationError} The token payload.
   * @async
   */
  async decodeToken(token, ignoreExpiration = false) {
    const payload = jwt.verify(token, env("auth").secret_key, {
      ignoreExpiration: ignoreExpiration,
    });

    if (payload.name) {
      switch (payload.name) {
        case "TokenExpiredError":
          return new DashboardValidationError("Token is expired.");
        case "JsonWebTokenError":
          return new DashboardValidationError(
            "Token malformed or signature invalid."
          );
        case "NotBeforeError":
          return new DashboardValidationError("Token not active.");
        default:
          return new DashboardValidationError("Token is not valid.");
      }
    } else {
      return payload.data !== undefined ? payload.data : payload;
    }
  }

  /**
   * Validate reCAPTCHA token
   *
   * @param {string} token Token to validate.
   *
   * @returns {Promise<*>} recaptcha result.
   * @async
   */
  async verifyCaptcha(token) {
    const secret = env("recaptcha").google_server;

    /**
     * Although is a POST request, google requires the data to be sent by query
     * params, trying to do so in the body will result on an error.
     */
    return await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secret}&response=${token}`
    );
  }
}
