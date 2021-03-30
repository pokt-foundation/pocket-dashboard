import mongoose from "mongoose";
import env from "environment";

export const connect = (url = env("persistence").default.url, opts = {}) => {
  return mongoose.connect(`${url}/${env("persistence").default.db_name}`, {
    ...opts,
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};
