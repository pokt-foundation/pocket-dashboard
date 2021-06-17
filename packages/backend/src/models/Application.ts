import { Schema, model, Model, Document, Types } from 'mongoose'
import { Encryptor, Decryptor } from 'strong-cryptor'
import isEmail from 'validator/lib/isEmail'
import { IFreeTierApplicationAccount, IGatewayAAT } from './types'
import env, { PersistenceKeys } from '../environment'

const MIN_PRIVATE_KEY_LENGTH = 128
const MIN_SECRET_KEY_LENGTH = 32

const cryptoKey = (env('PERSISTENCE') as PersistenceKeys).dbEncryptionKey
const encryptor = new Encryptor({ key: cryptoKey })
const decryptor = new Decryptor({ key: cryptoKey })

export interface IGatewaySettings {
  secretKey: string
  secretKeyRequired: boolean
  whitelistOrigins: string[]
  whitelistuserAgents: string[]
}

export interface INotificationSettings {
  signedUp: boolean
  quarter: boolean
  quarterLastSent?: Date | number
  half: boolean
  halfLastSent?: Date | number
  threeQuarters: boolean
  threeQuartersLastSent?: Date | number
  full: boolean
  fullLastSent?: Date | number
  createdAt?: Date | number
}

export interface IApplication extends Document {
  chain: string
  name: string
  user: Types.ObjectId
  freeTier: boolean
  status: string
  lastChangedStatusAt: Date | number
  freeTierApplicationAccount: IFreeTierApplicationAccount
  gatewayAAT: IGatewayAAT
  gatewaySettings: IGatewaySettings
  notificationSettings: INotificationSettings
}

const applicationSchema = new Schema(
  {
    chain: String,
    name: String,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
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
      quarterLastSent: Date,
      half: Boolean,
      halfLastSent: Date,
      threeQuarters: Boolean,
      threeQuartersLastSent: Date,
      full: Boolean,
      fullLastSent: Date,
    },
    createdAt: {
      type: Date,
      default: new Date(Date.now()),
    },
  },
  { collection: 'Applications' }
)

applicationSchema.statics.validateMetadata = function validateMetadata({
  name,
  owner,
  user,
  contactEmail,
}) {
  if (!name || !owner || !user || !contactEmail) {
    return false
  }
  return isEmail(contactEmail)
}
applicationSchema.statics.encryptSensitiveFields = function encryptSensitiveFields(
  privateKey,
  secretKey
) {
  if (!(privateKey.length <= MIN_PRIVATE_KEY_LENGTH)) {
    throw new Error('Wrong private key length')
  }
  if (!(secretKey.length <= MIN_SECRET_KEY_LENGTH)) {
    throw new Error('Wrong secret key length')
  }
  const encryptedPrivateKey = encryptor.encrypt(privateKey)
  const encryptedSecretKey = encryptor.encrypt(secretKey)

  return {
    encryptedPrivateKey,
    encryptedSecretKey,
  }
}
applicationSchema.statics.decryptSensitiveFields = function decryptSensitiveFields(
  privateKey,
  secretKey
) {
  if (!(privateKey.length <= MIN_PRIVATE_KEY_LENGTH)) {
    throw new Error('Wrong private key length')
  }
  if (!(secretKey.length <= MIN_SECRET_KEY_LENGTH)) {
    throw new Error('Wrong secret key length')
  }
  const encryptedPrivateKey = decryptor.decrypt(privateKey)
  const encryptedSecretKey = decryptor.decrypt(secretKey)

  return {
    encryptedPrivateKey,
    encryptedSecretKey,
  }
}

const ApplicationModel: Model<IApplication> = model(
  'Application',
  applicationSchema
)

export default ApplicationModel
