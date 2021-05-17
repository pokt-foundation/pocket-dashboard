import { Schema, model, Model, Document } from "mongoose";
import { IFreeTierApplicationAccount, IGatewayAAT } from "./types";

export interface IPreStakedApp extends Document {
  chain: string;
  status: string;
  createdAt: Date | number;
  fundingTxHash: string;
  stakingTxHash: string;
  freeTierApplicationAccount: IFreeTierApplicationAccount;
  gatewayAAT: IGatewayAAT;
}

const preStakedAppSchema = new Schema(
  {
    chain: String,
    status: String,
    createdAt: Date,
    fundingTxHash: String,
    stakingTxHash: String,
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
  },
  { collection: "PreStakedAppPool" }
);

const PreStakedAppModel: Model<IPreStakedApp> = model(
  "PreStakedApp",
  preStakedAppSchema
);

export default PreStakedAppModel;
