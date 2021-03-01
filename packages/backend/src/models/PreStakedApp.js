import { Schema, model } from "mongoose";

const preStakedAppSchema = new Schema(
  {
    chain: String,
    status: String,
    freeTierApplicationAccount: {
      address: String,
      publicKey: String,
      privateKey: String,
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

const PreStakedAppModel = model("PreStakedApp", preStakedAppSchema);

export default PreStakedAppModel;
