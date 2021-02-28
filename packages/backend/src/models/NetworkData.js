import { Schema, model } from "mongoose";

const networkDataSchema = new Schema(
  {
    nodesStaked: Number,
    AppsStaked: Number,
    poktStaked: Number,
    createdAt: Date,
  },
  { collection: "NetworkData" }
);

const NetworkDataModel = model("NetworkData", networkDataSchema);

export default NetworkDataModel;
