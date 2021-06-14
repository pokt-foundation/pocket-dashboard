import { Schema, model, Model, Document, Types } from 'mongoose'

interface INotificationSettings {
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

export interface ILoadBalancer extends Document {
  user: Types.ObjectId
  name: string
  requestTimeOut: string
  applicationIDs: string[]
  notificationSettings: INotificationSettings
  createdAt: Date | number
}

const LoadBalancerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    requestTimeOut: String,
    applicationIDs: [],
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
  { collection: 'LoadBalancers' }
)

const LoadBalancerModel: Model<ILoadBalancer> = model(
  'LoadBalancers',
  LoadBalancerSchema
)

export default LoadBalancerModel
