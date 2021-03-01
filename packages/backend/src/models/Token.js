import { Schema, model } from "mongoose";

export const TOKEN_TYPES = {
  verification: "TOKEN_VERIFICATION",
  reset: "TOKEN_RESET",
};

const tokenSchema = new Schema(
  {
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // ms
    },
    token: String,
    type: String,
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  { collection: "Tokens" }
);

const TokenModel = model("Token", tokenSchema);
