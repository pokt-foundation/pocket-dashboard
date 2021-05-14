import { Schema, Model, model, Document } from "mongoose";

interface IChain extends Document {
  _id: string;
  networkID: string;
  ticker: string;
  name: string;
  descrpition: string;
  hash: string;
  nodeCount: string;
}

const chainSchema = new Schema(
  {
    _id: String,
    networkID: String,
    ticker: String,
    name: String,
    description: String,
    hash: String,
    nodeCount: Number,
  },
  { collection: "Blockchains" }
);

const ChainModel: Model<IChain> = model("Chain", chainSchema);

export default ChainModel;
