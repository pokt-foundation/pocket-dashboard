import { Schema, model } from "mongoose";
import { Encryptor, Decryptor } from "strong-cryptor";
import isEmail from "validator/lib/isEmail";
import env from "environment";

const cryptoKey = env("persistence").default.db_encryption_key;
const encryptor = new Encryptor({ key: cryptoKey });
const decryptor = new Decryptor({ key: cryptoKey });

const MIN_PRIVATE_KEY_LENGTH = 128;
const MIN_SECRET_KEY_LENGTH = 32;

const applicationSchema = new Schema(
  {
    chain: String,
    name: String,
    user: { type: Schema.Types.ObjectId, ref: "User" },
    freeTier: Boolean,
    status: String,
    lastChangedStatusAt: Date,
    freeTierApplicationAccount: {
      address: String,
      publicKey: String,
      privateKey: String,
      passPhrase: String,
    },
    gatewayAAT: {
      version: String,
      clientPublicKey: String,
      applicationPublicKey: String,
      applicationSignature: String,
    },
    gatewaySettings: {
      secretKey: String,
      secretKeyRequired: Boolean,
      whitelistOrigins: [],
      whitelistUserAgents: [],
    },
    notificationSettings: {
      signedUp: Boolean,
      quarter: Boolean,
      half: Boolean,
      threeQuarters: Boolean,
      full: Boolean,
    },
    createdAt: {
      type: Date,
      default: new Date(Date.now()),
    },
  },
  { collection: "Applications" }
);

applicationSchema.statics.validateMetadata = function validateMetadata({
  name,
  owner,
  user,
  contactEmail,
}) {
  if (!name || !owner || !user || !contactEmail) {
    return false;
  }

  return isEmail(contactEmail);
};

applicationSchema.statics.encryptSensitiveFields = function encryptSensitiveFields(
  privateKey,
  secretKey
) {
  if (!privateKey.length <= MIN_PRIVATE_KEY_LENGTH) {
    throw new Error("Wrong private key length");
  }

  if (!secretKey.length <= MIN_SECRET_KEY_LENGTH) {
    throw new Error("Wrong secret key length");
  }

  const encryptedPrivateKey = encryptor.encrypt(privateKey);
  const encryptedSecretKey = encryptor.encrypt(secretKey);

  return {
    encryptedPrivateKey,
    encryptedSecretKey,
  };
};

applicationSchema.statics.decryptSensitiveFields = function decryptSensitiveFields(
  privateKey,
  secretKey
) {
  if (!privateKey.length <= MIN_PRIVATE_KEY_LENGTH) {
    throw new Error("Wrong private key length");
  }

  if (!secretKey.length <= MIN_SECRET_KEY_LENGTH) {
    throw new Error("Wrong secret key length");
  }

  const encryptedPrivateKey = decryptor.decrypt(privateKey);
  const encryptedSecretKey = encryptor.decrypt(secretKey);

  return {
    encryptedPrivateKey,
    encryptedSecretKey,
  };
};

const ApplicationModel = model("Application", applicationSchema);

export default ApplicationModel;
