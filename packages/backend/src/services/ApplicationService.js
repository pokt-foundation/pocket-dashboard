import {
  ExtendedPocketApplication,
  PocketApplication,
  RegisteredPocketApplication,
  StakedApplicationSummary,
  UserPocketApplication,
} from "../models/Application";
import { PrivatePocketAccount, PublicPocketAccount } from "../models/Account";
import {
  Application,
  PocketAAT,
  StakingStatus,
  typeGuard,
  UnlockedAccount,
} from "@pokt-network/pocket-js";
import UserService from "./UserService";
import BasePocketService from "./BasePocketService";
import bigInt from "big-integer";
import {
  DashboardError,
  DashboardValidationError,
  PocketNetworkError,
} from "../models/Exceptions";
import TransactionService from "./TransactionService";
import { POST_ACTION_TYPE, TransactionPostAction } from "../models/Transaction";
import env from "environment";
import { POKT_DENOMINATIONS } from "./PocketService";
import PocketService from "./PocketService";
import { ObjectID } from "mongodb";
import { Encryptor, Decryptor } from "strong-cryptor";
import EmailService from "../services/EmailService";

const crypto = require("crypto");
const cryptoKey = env("persistence").default.db_encryption_key;
const encryptor = new Encryptor({ key: cryptoKey });
const decryptor = new Decryptor({ key: cryptoKey });

const APPLICATION_COLLECTION_NAME = "Applications";
const aws = require("aws-sdk");

export default class ApplicationService extends BasePocketService {
  constructor() {
    super();

    this.userService = new UserService();
    this.transactionService = new TransactionService();
    this.pocketService = new PocketService();
  }

  /**
   * Encrypt necessary application fields before persisting
   *
   * @async
   * @private
   * @param {PocketApplication} application Application to encrypt necessary fields
   * @returns {PocketApplication} returns the application with the encrypted fields.
   */
  async __encryptApplicationFields(application) {
    if (
      application.freeTierApplicationAccount &&
      application.freeTierApplicationAccount.privateKey &&
      application.freeTierApplicationAccount.privateKey.length === 128
    ) {
      application.freeTierApplicationAccount.privateKey = encryptor.encrypt(
        application.freeTierApplicationAccount.privateKey
      );
    }
    if (
      application.gatewaySettings &&
      application.gatewaySettings.secretKey &&
      application.gatewaySettings.secretKey === 32
    ) {
      application.gatewaySettings.secretKey = encryptor.encrypt(
        application.gatewaySettings.secretKey
      );
    }
    return application;
  }

  /**
   * Decrypt application fields before persisting
   *
   * @async
   * @private
   * @param {PocketApplication} application Application to decrypt necessary fields
   * @returns {PocketApplication} applications with decrypted fields.
   */
  async __decryptApplicationFields(application) {
    if (
      application.freeTierApplicationAccount &&
      application.freeTierApplicationAccount.privateKey &&
      application.freeTierApplicationAccount.privateKey.length > 128
    ) {
      application.freeTierApplicationAccount.privateKey = decryptor.decrypt(
        application.freeTierApplicationAccount.privateKey
      );
    }
    if (
      application.gatewaySettings &&
      application.gatewaySettings.secretKey &&
      application.gatewaySettings.secretKey > 32
    ) {
      application.gatewaySettings.secretKey = decryptor.decrypt(
        application.gatewaySettings.secretKey
      );
    }
    return application;
  }

  /**
   * Persist application on db if not exists.
   *
   * @async
   * @private
   * @param {PocketApplication} application Application to persist.
   * @returns {Promise<string | boolean>} If application was persisted return id, if not return false.
   */
  async __persistApplicationIfNotExists(application) {
    if (!(await this.applicationExists(application))) {
      /** @type {{insertedId: string, result: {n:number, ok: number}}} */
      const applicationEncrypted = await this.__encryptApplicationFields(
        application
      );
      const result = await this.persistenceService.saveEntity(
        APPLICATION_COLLECTION_NAME,
        applicationEncrypted
      );

      return result.result.ok === 1 ? result.insertedId : "0";
    }

    return false;
  }

  /**
   * Update application on db if exists.
   *
   * @async
   * @private
   * @param {PocketApplication} application Application to update.
   * @returns {Promise<boolean>} If application was updated or not.
   */
  async __updatePersistedApplication(application) {
    if (await this.applicationExists(application)) {
      const filter = {
        _id: ObjectID(application.id),
      };

      /** @type {{result: {n:number, ok: number}}} */
      const applicationEncrypted = await this.__encryptApplicationFields(
        application
      );
      const result = await this.persistenceService.updateEntity(
        APPLICATION_COLLECTION_NAME,
        filter,
        applicationEncrypted
      );

      return result.result.ok === 1;
    }

    return false;
  }

  /**
   * Update application on db by ID.
   *
   * @async
   * @private
   * @param {string} applicationID Application ID.
   * @param {PocketApplication} application Application to update
   * @returns {Promise<boolean>} If application was updated or not.
   */
  async __updateApplicationByID(applicationID, application) {
    /** @type {{result: {n:number, ok: number}}} */
    const applicationEncrypted = await this.__encryptApplicationFields(
      application
    );
    const result = await this.persistenceService.updateEntityByID(
      APPLICATION_COLLECTION_NAME,
      applicationID,
      applicationEncrypted
    );

    return result.result.ok === 1;
  }

  /**
   *
   * @async
   * @private
   * @param {PocketApplication} application Application to add pocket data.
   * @returns {Promise<ExtendedPocketApplication>} Pocket application with pocket data.
   */
  async __getExtendedPocketApplication(application) {
    let networkApplication;
    const appParameters = await this.pocketService.getApplicationParameters();

    try {
      networkApplication = await this.__decryptApplicationFields(
        this.pocketService.getApplication(
          application.publicPocketAccount.address
        )
      );
    } catch (e) {
      networkApplication = ExtendedPocketApplication.createNetworkApplication(
        application.publicPocketAccount,
        appParameters
      );
    }
    const extendedPocketApplication = ExtendedPocketApplication.createExtendedPocketApplication(
      application,
      networkApplication
    );

    return extendedPocketApplication;
  }

  /**
   *
   * @async
   * @private
   * @param {PocketApplication} application Application to add pocket data.
   * @returns {Promise<ExtendedPocketApplication>} Pocket application with pocket data.
   */
  async __getExtendedPocketClientApplication(application) {
    let networkApplication;
    const appParameters = await this.pocketService.getApplicationParameters();
    const address =
      application.freeTierApplicationAccount.address ||
      application.publicPocketAccount.address;

    try {
      networkApplication = await this.__decryptApplicationFields(
        this.pocketService.getApplication(address)
      );
    } catch (e) {
      networkApplication = ExtendedPocketApplication.createNetworkApplication(
        application.publicPocketAccount,
        appParameters
      );
    }

    return ExtendedPocketApplication.createExtendedPocketApplication(
      application,
      networkApplication
    );
  }

  /**
   * Mark application as free tier.
   *
   * @async
   * @private
   * @param {PocketApplication} application Pocket application to mark as free tier.
   * @param {boolean} freeTier If is free tier or not.
   * @returns {boolean} Whether the aplication was correctly updated or not.
   */
  async __markApplicationAsFreeTier(application, freeTier) {
    const filter = {
      _id: ObjectID(application.id),
    };

    application.freeTier = freeTier;
    /** @type {{result: {n:number, ok: number}}} */
    const applicationEncrypted = await this.__encryptApplicationFields(
      application
    );
    const result = await this.persistenceService.updateEntity(
      APPLICATION_COLLECTION_NAME,
      filter,
      applicationEncrypted
    );

    return result.result.ok === 1;
  }

  /**
   * Check if application exists on DB.
   *
   * @async
   * @param {PocketApplication} application Application to check if exists.
   * @returns {Promise<boolean>} If the application exists or not.
   */
  async applicationExists(application) {
    let filter = {};

    if (application.publicPocketAccount.address) {
      filter["publicPocketAccount.address"] =
        application.publicPocketAccount.address;
    } else {
      filter["name"] = application.name;
    }

    const dbApplication = await this.persistenceService.getEntityByFilter(
      APPLICATION_COLLECTION_NAME,
      filter
    );

    return dbApplication !== undefined;
  }

  /**
   * Import application data from network.
   *
   * @async
   * @private
   * @param {string} applicationAddress Application address.
   * @returns {Promise<Application>} Application data.
   * @throws {DashboardValidationError | PocketNetworkError} If the application already exists on dashboard or application does exist on network.
   */
  async importApplication(applicationAddress) {
    const filter = {
      "publicPocketAccount.address": applicationAddress,
    };

    const applicationDB = await this.__decryptApplicationFields(
      await this.persistenceService.getEntityByFilter(
        APPLICATION_COLLECTION_NAME,
        filter
      )
    );

    if (applicationDB) {
      throw new DashboardValidationError(
        "Application already exists in dashboard"
      );
    }

    try {
      return this.pocketService.getApplication(applicationAddress);
    } catch (e) {
      throw new PocketNetworkError("Application does not exist on network");
    }
  }

  /**
   * Verify if the application belongs to the client's account using an application id
   *
   * @async
   * @param {string} applicationId Application Identifier.
   * @param {string} authHeader Authorization header.
   * @returns {Promise<boolean>} True if the app belongs to the client account or false otherwise.
   */
  async verifyApplicationBelongsToClient(applicationId, authHeader) {
    // Retrieve the session tokens from the auth headers
    const accessToken = authHeader.split(", ")[0].split(" ")[1];
    const userEmail = authHeader.split(", ")[2].split(" ")[1];

    if (accessToken && userEmail) {
      const payload = await this.userService.decodeToken(accessToken, true);

      if (payload instanceof DashboardValidationError) {
        throw payload;
      }
      // Use token email to retrieve a list of the apps
      const application = await this.getClientApplication(applicationId);

      if (
        application.pocketApplication.user.toString() === userEmail.toString()
      ) {
        return true;
      }
    }

    return false;
  }

  /**
   * Get client's application account data.
   *
   * @async
   * @param {string} applicationId Application address.
   * @returns {Promise<ExtendedPocketApplication>} Application data.
   */
  async getClientApplication(applicationId) {
    const filter = {
      _id: ObjectID(applicationId),
    };

    const applicationDB = await this.__decryptApplicationFields(
      await this.persistenceService.getEntityByFilter(
        APPLICATION_COLLECTION_NAME,
        filter
      )
    );

    if (applicationDB) {
      const application = PocketApplication.createPublicPocketApplication(
        applicationDB
      );

      return this.__getExtendedPocketClientApplication(application);
    }

    return null;
  }

  /**
   * Get application data.
   *
   * @async
   * @param {string} applicationAddress Application address.
   * @returns {Promise<ExtendedPocketApplication>} Application data.
   */
  async getApplication(applicationAddress) {
    try {
      const filter = {
        "publicPocketAccount.address": applicationAddress,
      };

      const applicationDB = await this.persistenceService.getEntityByFilter(
        APPLICATION_COLLECTION_NAME,
        filter
      );

      if (applicationDB) {
        const decryptedFields = await this.__decryptApplicationFields(
          applicationDB
        );

        if (decryptedFields) {
          const application = PocketApplication.createPocketApplication(
            decryptedFields
          );

          return this.__getExtendedPocketApplication(application);
        }
      }

      return null;
    } catch (error) {
      return error;
    }
  }

  /**
   * Get private application data.
   *
   * @async
   * @param {string} applicationId Application Id.
   * @returns {Promise<ExtendedPocketApplication>} Application data.
   */
  async getPrivateApplication(applicationId) {
    const filter = {
      _id: ObjectID(applicationId),
    };

    const applicationDB = await this.__decryptApplicationFields(
      await this.persistenceService.getEntityByFilter(
        APPLICATION_COLLECTION_NAME,
        filter
      )
    );

    if (applicationDB) {
      const application = PocketApplication.createPocketPrivateApplication(
        applicationDB
      );

      return this.__getExtendedPocketApplication(application);
    }

    return null;
  }

  /**
   * Get application data on network.
   *
   * @async
   * @param {string} applicationAddress Application address.
   * @returns {Promise<Application>} Application data.
   */
  async getNetworkApplication(applicationAddress) {
    return this.pocketService.getApplication(applicationAddress);
  }

  /**
   * Get all applications on network.
   *
   * @param {number} limit Limit of query.
   * @param {number} [offset] Offset of query.
   *
   * @returns {RegisteredPocketApplication[]} List of applications.
   * @async
   */
  async getAllApplications(limit, offset = 0) {
    const networkApplications = await this.pocketService.getApplications(
      StakingStatus.Staked
    );

    return networkApplications.map(
      PocketApplication.createRegisteredPocketApplication
    );
  }

  /**
   * Get all applications on network that belongs to user.
   *
   * @async
   * @param {string} userEmail Email of user.
   * @param {number} limit Limit of query.
   * @param {number} [offset] Offset of query.
   * @returns {Promise<UserPocketApplication[]>} List of applications.
   */
  async getUserApplications(userEmail, limit, offset = 0) {
    const filter = { user: userEmail };

    const dashboardApplicationData = (
      await this.__decryptApplicationFields(
        await this.persistenceService.getEntities(
          APPLICATION_COLLECTION_NAME,
          filter,
          limit,
          offset
        )
      )
    )
      .map(PocketApplication.createPocketApplication)
      .map((app) => {
        return {
          id: app.id,
          name: app.name,
          address:
            app.freeTierApplicationAccount.address ||
            app.publicPocketAccount.address,
          icon: app.icon,
        };
      });

    const dashboardApplicationAddresses = dashboardApplicationData
      .map((app) => app.address)
      .filter((address) => address.length > 0);

    const networkApplications = await this.pocketService.getAllApplications(
      dashboardApplicationAddresses
    );

    if (dashboardApplicationData.length > 0) {
      return dashboardApplicationData.map((app) =>
        PocketApplication.createUserPocketApplication(app, networkApplications)
      );
    }

    return [];
  }

  /**
   * Get staked application summary from network.
   *
   * @async
   * @returns {Promise<StakedApplicationSummary>} Summary data of staked applications.
   */
  async getStakedApplicationSummary() {
    try {
      const stakedApplications = await this.pocketService.getApplications(
        StakingStatus.Staked
      );

      const averageStaked = this._getAverageNetworkData(
        stakedApplications.map((app) => Number(app.stakedTokens.toString()))
      );
      const totalStaked = this._getAverageNetworkData(
        stakedApplications.map((app) => bigInt(app.stakedTokens.toString()))
      );

      const averageStakedResult = averageStaked / stakedApplications.length;

      return new StakedApplicationSummary(
        stakedApplications.length.toString(),
        averageStakedResult.toString(),
        totalStaked.toString()
      );
    } catch (e) {
      return new StakedApplicationSummary("0", "0", "0");
    }
  }

  /**
   * Get AAT using Free tier account.
   *
   * @async
   * @param {string} applicationId The application Identifier.
   * @returns {Promise<PocketAAT | boolean>} AAT for application.
   */
  async getFreeTierAAT(applicationId) {
    const filter = {
      _id: ObjectID(applicationId),
    };

    const applicationDB = await this.__decryptApplicationFields(
      await this.persistenceService.getEntityByFilter(
        APPLICATION_COLLECTION_NAME,
        filter
      )
    );

    if (!applicationDB) {
      return false;
    }

    try {
      const { aat_version: aatVersion } = env("pocket_network");
      const {
        publicPocketAccount: { publicKey: applicationPublicKeyHex },
        freeTierApplicationAccount: {
          publicKey: appAccountPublicKeyHex,
          privateKey: appAccountPrivateKeyHex,
        },
      } = applicationDB;

      return await PocketAAT.from(
        aatVersion,
        applicationPublicKeyHex,
        appAccountPublicKeyHex,
        appAccountPrivateKeyHex
      );
    } catch (e) {
      return false;
    }
  }
  /**
   * Stake a free tier application.
   *
   * @async
   * @param {ExtendedPocketApplication} application Application to stake.
   * @param {{client_address: string, chains: string[], stake_amount: string}} stakeInformation Information for the stake action.
   * @param {{name: string, link: string}} emailData Email data.
   * @returns {Promise<PocketAAT | boolean>} If application was created or not.
   */
  async stakeFreeTierApplication(application, stakeInformation, emailData) {
    const {
      main_fund_address: mainFundAccount,
      aat_version: aatVersion,
      free_tier: {
        client_pub_key: clientPublicKey,
        stake_amount: upoktToStake,
        max_relay_per_day_amount: maxRelayPerDayAmount,
      },
    } = env("pocket_network");

    if (
      aatVersion === undefined ||
      upoktToStake === undefined ||
      maxRelayPerDayAmount === undefined
    ) {
      throw new Error(
        "Couldn't retrieve aatVersion and/or upoktToStake and/or maxRelayPerDayAmount values for free tier stake."
      );
    }

    // Generate a passphrase for the app account
    const passphrase = crypto.randomBytes(16).toString("hex");

    // Create Application credentials.
    const appAccount = await this.pocketService.createUnlockedAccount(
      passphrase
    );

    if (!typeGuard(appAccount, UnlockedAccount)) {
      throw appAccount;
    }

    const appAccountPublicKeyHex = appAccount.publicKey.toString("hex");
    const appAccountPrivateKeyHex = appAccount.privateKey.toString("hex");

    // First transfer funds from the main fund to the new Application account.
    const fundingTransactionHash = await this.pocketService.transferFromFreeTierFund(
      upoktToStake,
      appAccount.addressHex
    );

    // Create the stake transaction object
    const appStakeTransaction = await this.pocketService.appStakeRequest(
      appAccount.addressHex,
      passphrase,
      stakeInformation.chains,
      stakeInformation.stake_amount
    );

    // Create post confirmation action to stake application.
    const contactEmail = application.pocketApplication.contactEmail;

    const appStakeAction = new TransactionPostAction(
      POST_ACTION_TYPE.stakeApplication,
      {
        appStakeTransaction,
        contactEmail,
        emailData,
        address: stakeInformation.client_address,
        paymentEmailData: {
          amountPaid: 0,
          poktStaked: upoktToStake / Math.pow(10, POKT_DENOMINATIONS.upokt),
          maxRelayPerDayAmount,
        },
      }
    );

    // Create job to monitor transaction confirmation
    const result = await this.transactionService.addTransferTransaction(
      fundingTransactionHash,
      appStakeAction
    );

    if (!result) {
      throw new Error("Couldn't add funding transaction for processing");
    }

    // Set the free tier credentials.
    application.pocketApplication.freeTierApplicationAccount = new PrivatePocketAccount(
      appAccount.addressHex,
      appAccountPublicKeyHex,
      appAccountPrivateKeyHex
    );
    application.pocketApplication.freeTier = true;

    // Backup Free Tier private keys to encrypted S3 bucket
    const {
      access_key_id: awsAccessKeyID,
      secret_access_key: awsSecretAccessKey,
      region: awsRegion,
      s3_fts_bucket: awsS3FTSBucket,
    } = env("aws");

    const s3 = new aws.S3({
      accessKeyId: awsAccessKeyID,
      secretAccessKey: awsSecretAccessKey,
      region: awsRegion,
    });

    const s3UploadParams = {
      Bucket: awsS3FTSBucket,
      Key: appAccount.addressHex,
      Body: JSON.stringify(
        application.pocketApplication.freeTierApplicationAccount
      ),
    };

    try {
      const s3Response = await s3.upload(s3UploadParams).promise();

      console.log("Free Tier account backup: " + s3Response.Location);
    } catch (err) {
      console.log(err);
    }

    // Generate app signed AAT for the free tier
    const freeTierAAT = await PocketAAT.from(
      aatVersion,
      application.pocketApplication.publicPocketAccount.publicKey,
      appAccountPublicKeyHex,
      appAccountPrivateKeyHex
    );

    // Generate signed AAT for use on the Gateway that uses our pubkey
    const gatewayAAT = await PocketAAT.from(
      aatVersion,
      clientPublicKey,
      appAccountPublicKeyHex,
      appAccountPrivateKeyHex
    );

    if (typeGuard(gatewayAAT, PocketAAT) && typeGuard(freeTierAAT, PocketAAT)) {
      // Add the gateway aat
      application.pocketApplication.gatewayAAT = {
        version: gatewayAAT.version,
        clientPublicKey: gatewayAAT.clientPublicKey,
        applicationPublicKey: gatewayAAT.applicationPublicKey,
        applicationSignature: gatewayAAT.applicationSignature,
      };

      // Add the free tier aat
      application.pocketApplication.freeTierAAT = {
        version: freeTierAAT.version,
        clientPublicKey: freeTierAAT.clientPublicKey,
        applicationPublicKey: freeTierAAT.applicationPublicKey,
        applicationSignature: freeTierAAT.applicationSignature,
      };

      await this.__updatePersistedApplication(application.pocketApplication);

      return freeTierAAT;
    } else {
      throw new Error("Failed to generate AAT information.");
    }
  }

  /**
   * Unstake free tier application.
   *
   * @param {object} unstakeInformation Object that holds the unstake information
   * @param {string} applicationLink Link to detail for email.
   *
   * @async
   */
  async unstakeFreeTierApplication(unstakeInformation, applicationLink) {
    // Retrieve the private application account information

    const application = await this.getPrivateApplication(
      unstakeInformation.application_id
    );
    const freeTierApplicationAccount =
      application.pocketApplication.freeTierApplicationAccount;

    // Generate a passphrase for the app account
    const passphrase = crypto.randomBytes(16).toString("hex");

    // Import the application to the keybase
    const pocketAccount = await this.pocketService.importAccountFromPrivateKey(
      freeTierApplicationAccount.privateKey,
      passphrase
    );

    // Create unstake transaction request
    const appUnstakeRequest = await this.pocketService.appUnstakeRequest(
      pocketAccount.addressHex,
      passphrase
    );

    // Submit transaction
    const appUnstakedTransaction = await this.pocketService.submitRawTransaction(
      appUnstakeRequest.address,
      appUnstakeRequest.txHex
    );

    const emailData = {
      address: application.pocketApplication.address,
      userName: application.pocketApplication.user,
      contactEmail: application.pocketApplication.contactEmail,
      applicationData: {
        name: application.pocketApplication.name,
        link: applicationLink,
      },
    };

    // Add transaction to queue
    const result = await this.transactionService.addAppUnstakeTransaction(
      appUnstakedTransaction,
      emailData
    );

    if (!result) {
      throw new Error(
        "Couldn't register app unstake transaction for email notification"
      );
    }

    await this.__markApplicationAsFreeTier(
      application.pocketApplication,
      false
    );
  }

  /**
   * Stake an application on network.
   *
   * @param {string} appAddress Application address.
   * @param {string} upoktToStake UPokt to stake.
   * @param {{address: string, raw_hex_bytes: string}} appStakeTransaction Transaction to stake.
   * @param {ExtendedPocketApplication} application Application to stake.
   * @param {{name: string, link: string}} emailData Email data.
   * @param {object} paymentEmailData Payment email data.
   * @param {string} gatewayAATSignature Signature created by signing an AAT with gateway client pub key
   *
   * @throws {Error}
   */
  async stakeApplication(
    appAddress,
    upoktToStake,
    appStakeTransaction,
    application,
    emailData,
    paymentEmailData,
    gatewayAATSignature
  ) {
    // First transfer funds from the main fund
    const fundingTransactionHash = await this.pocketService.transferFromMainFund(
      upoktToStake,
      appAddress
    );

    // Create post confirmation action to stake application
    const contactEmail = application.pocketApplication.contactEmail;
    const appStakeAction = new TransactionPostAction(
      POST_ACTION_TYPE.stakeApplication,
      {
        appStakeTransaction,
        address: appAddress,
        contactEmail,
        emailData,
        paymentEmailData,
      }
    );

    // Create job to monitor transaction confirmation
    const result = await this.transactionService.addTransferTransaction(
      fundingTransactionHash,
      appStakeAction
    );

    if (!result) {
      throw new Error("Couldn't add funding transaction for processing");
    }

    // Create Gateway AAT using our client pub key and passed in signature
    const {
      aat_version: aatVersion,
      free_tier: { client_pub_key: clientPublicKey },
    } = env("pocket_network");

    application.pocketApplication.updatingStatus = true;

    application.pocketApplication.gatewayAAT = {
      version: aatVersion,
      clientPublicKey: clientPublicKey,
      applicationPublicKey:
        application.pocketApplication.publicPocketAccount.publicKey,
      applicationSignature: gatewayAATSignature,
    };

    await EmailService.to(contactEmail).sendPaymentCompletedAppEmail(
      contactEmail,
      emailData,
      paymentEmailData
    );
    await this.__updatePersistedApplication(application.pocketApplication);
    await this.__markApplicationAsFreeTier(
      application.pocketApplication,
      false
    );
  }

  /**
   * Unstake application.
   *
   * @async
   * @param {{address: string, raw_hex_bytes: string}} appUnstakeTransaction Transaction object.
   * @param {string} applicationLink Link to detail for email.
   * @param {string} authHeader Auth header.
   */
  async unstakeApplication(appUnstakeTransaction, applicationLink, authHeader) {
    const { address, raw_hex_bytes } = appUnstakeTransaction;

    // Retrieve app
    const application = await this.getApplication(address);

    // Check if the app belogns to the client
    if (
      await this.verifyApplicationBelongsToClient(
        application.pocketApplication.id,
        authHeader
      )
    ) {
      // Submit transaction
      const appUnstakedHash = await this.pocketService.submitRawTransaction(
        address,
        raw_hex_bytes
      );

      // Gather email data
      const emailData = {
        address: address,
        userName: application.pocketApplication.user,
        contactEmail: application.pocketApplication.contactEmail,
        applicationData: {
          name: application.pocketApplication.name,
          link: applicationLink,
        },
      };

      // Add transaction to queue
      const result = await this.transactionService.addAppUnstakeTransaction(
        appUnstakedHash,
        emailData
      );

      if (!result) {
        throw new Error(
          "Couldn't register app unstake transaction for email notification"
        );
      }

      application.pocketApplication.updatingStatus = true;

      await this.__markApplicationAsFreeTier(
        application.pocketApplication,
        false
      );
    } else {
      throw new Error(
        "Application doesn't belong to the provided client account."
      );
    }
  }

  /**
   * Create an application on the dashboard.
   *
   * @async
   * @param {object} applicationData Application data.
   * @param {string} applicationData.name Name.
   * @param {string} applicationData.owner Owner.
   * @param {string} applicationData.url URL.
   * @param {string} applicationData.contactEmail E-mail.
   * @param {string} applicationData.user User.
   * @param {string} [applicationData.description] Description.
   * @param {string} [applicationData.icon] Icon.
   * @returns {Promise<string | boolean>} If application was persisted return id, if not return false.
   * @throws {DashboardError} If validation fails or already exists.
   */
  async createApplication(applicationData) {
    if (PocketApplication.validate(applicationData)) {
      if (!(await this.userService.userExists(applicationData.user))) {
        throw new DashboardError("User does not exist.");
      }

      const application = PocketApplication.createPocketApplication(
        applicationData
      );

      if (await this.applicationExists(application)) {
        throw new DashboardError(
          "An application with that name already exists, please use a different name."
        );
      }

      return this.__persistApplicationIfNotExists(application);
    }
  }

  /**
   * Save an application public account.
   *
   * @async
   * @param {string} applicationID Application ID.
   * @param {{address: string, publicKey: string}} accountData Application account data.
   * @returns {Promise<PocketApplication>} An application information.
   * @throws {Error} If application does not exists.
   */
  async saveApplicationAccount(applicationID, accountData) {
    const applicationDB = await this.__decryptApplicationFields(
      await this.persistenceService.getEntityByID(
        APPLICATION_COLLECTION_NAME,
        applicationID
      )
    );

    if (!applicationDB) {
      throw new Error("Application does not exists");
    }

    const application = PocketApplication.createPocketApplication(
      applicationDB
    );

    application.publicPocketAccount = new PublicPocketAccount(
      accountData.address,
      accountData.publicKey
    );

    await this.__updateApplicationByID(applicationID, application);

    return application;
  }

  /**
   * Delete an application from dashboard.
   *
   * @async
   * @param {string} applicationId Application Id.
   * @param {string} user Owner email of application.
   * @returns {Promise<PocketApplication>} The deleted application.
   */
  async deleteApplication(applicationId, user) {
    const filter = {
      _id: ObjectID(applicationId),
      user,
    };

    const applicationDB = await this.__decryptApplicationFields(
      await this.persistenceService.getEntityByFilter(
        APPLICATION_COLLECTION_NAME,
        filter
      )
    );

    if (applicationDB.freeTier === false) {
      await this.persistenceService.deleteEntities(
        APPLICATION_COLLECTION_NAME,
        filter
      );

      return PocketApplication.createPocketApplication(applicationDB);
    } else {
      throw new DashboardError("Free tier apps can't be deleted.");
    }
  }

  /**
   * Update an application on network.
   *
   * @async
   * @param {string} applicationId Application Id.
   * @param {object} applicationData Application data.
   * @param {string} applicationData.name Name.
   * @param {string} applicationData.owner Owner.
   * @param {string} applicationData.url URL.
   * @param {string} applicationData.contactEmail E-mail.
   * @param {string} applicationData.user User.
   * @param {string} [applicationData.description] Description.
   * @param {string} [applicationData.icon] Icon.
   * @returns {Promise<boolean>} If was updated or not.
   * @throws {DashboardError} If validation fails or does not exists.
   */
  async updateApplication(applicationId, applicationData) {
    if (PocketApplication.validate(applicationData)) {
      if (!(await this.userService.userExists(applicationData.user))) {
        throw new DashboardError("User does not exist");
      }

      const filter = {
        _id: ObjectID(applicationId),
      };

      const application = await this.__decryptApplicationFields(
        await this.persistenceService.getEntityByFilter(
          APPLICATION_COLLECTION_NAME,
          filter
        )
      );

      if (!application) {
        throw new DashboardError("Application does not exist");
      }

      const applicationToEdit = application;

      // Update the new fields
      applicationToEdit.name = applicationData.name;
      applicationToEdit.contactEmail = applicationData.contactEmail;
      applicationToEdit.description = applicationData.description;
      applicationToEdit.owner = applicationData.owner;
      applicationToEdit.url = applicationData.url;
      applicationToEdit.icon = applicationData.icon;

      if (applicationData.gatewaySettings) {
        applicationToEdit.gatewaySettings.secretKeyRequired =
          applicationData.gatewaySettings.secretKeyRequired;
        applicationToEdit.gatewaySettings.whitelistOrigins =
          applicationData.gatewaySettings.whitelistOrigins;
        applicationToEdit.gatewaySettings.whitelistUserAgents =
          applicationData.gatewaySettings.whitelistUserAgents;
      }

      return this.__updatePersistedApplication(applicationToEdit);
    }

    return false;
  }

  /**
   * Update an App status.
   *
   * @async
   * @param {string} address App account address.
   * @param {boolean} status App updatingStatus.
   */
  async changeUpdatingStatus(address, status) {
    // Retrieve app
    const application = await this.getApplication(address);

    if (application === undefined || application === null) {
      throw new Error(`Couldn't find an app with this address: ${address}`);
    }

    application.pocketApplication.updatingStatus = status;
    await this.__updatePersistedApplication(application.pocketApplication);
  }
}
