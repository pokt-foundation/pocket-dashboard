import mongoose from "mongoose";
import env from "environment";

export const connect = (url = env("persistence").default.url, opts = {}) => {
  console.log(env("persistence").default.url);
  return mongoose.connect(`${url}/${env("persistence").default.db_name}`, {
    ...opts,
    useNewUrlParser: true,
  });
};
