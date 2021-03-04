import { Schema, model } from "mongoose";

const networkDataSchema = new Schema(
  {
    nodesStaked: Number,
    appsStaked: Number,
    poktStaked: String,
    createdAt: Date,
  },
  { collection: "NetworkData" }
);

const NetworkDataModel = model("NetworkData", networkDataSchema);

export default NetworkDataModel;
