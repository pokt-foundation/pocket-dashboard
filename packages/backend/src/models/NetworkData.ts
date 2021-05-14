import { Schema, model, Model, Document } from "mongoose";

interface INetworkData extends Document {
  nodesStaked: number;
  appsStaked: number;
  poktStaked: string;
  createdAt: Date;
}

const networkDataSchema = new Schema(
  {
    nodesStaked: Number,
    appsStaked: Number,
    poktStaked: String,
    createdAt: Date,
  },
  { collection: "NetworkData" }
);

const NetworkDataModel: Model<INetworkData> = model(
  "NetworkData",
  networkDataSchema
);

export default NetworkDataModel;
