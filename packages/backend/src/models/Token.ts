import { Schema, model, Model, Document, Types } from 'mongoose'

export const TOKEN_TYPES = {
  verification: 'TOKEN_VERIFICATION',
  reset: 'TOKEN_RESET',
}

export interface IToken extends Document {
  createdAt: Date
  token: string
  type: 'TOKEN_VERIFICATION' | 'TOKEN_RESET'
  userId: Types.ObjectId
  email: string
}

const tokenSchema = new Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 3600, // s
    },
    token: String,
    type: String,
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    email: String,
  },
  { collection: 'Tokens' }
)

const TokenModel: Model<IToken> = model('Token', tokenSchema)

export default TokenModel
