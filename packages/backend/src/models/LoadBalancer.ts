import { Schema, model, Model, Document, Types } from 'mongoose'

export interface ILoadBalancer extends Document {
  user: Types.ObjectId
  name: string
  requestTimeOut: string
  applicationIDs: string
  createdAt: Date | number
}

const LoadBalancerSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: String,
    requestTimeOut: String,
    applicationIDs: [],
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
