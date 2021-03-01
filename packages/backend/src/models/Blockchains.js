import { Schema, model } from "mongoose";

const chainSchema = new Schema(
  {
    networkID: String,
    ticker: String,
    name: String,
    description: String,
    hash: String,
    nodeCount: Number
  },
  { collection: "Blockchains" }
);

const ChainModel = model("Chain", chainSchema);

export default ChainModel;
