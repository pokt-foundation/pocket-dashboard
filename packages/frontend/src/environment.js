const ENV_VARS = {
  BACKEND_URL() {
    return process.env.REACT_APP_BACKEND_URL ?? "";
  },
  HASURA_URL() {
    return process.env.REACT_APP_TIMESCALE_URL ?? "";
  },
  BUILD() {
    return process.env.REACT_APP_BUILD ?? "undefined";
  },
  PROD() {
    return process.env.NODE_ENV === "production";
  },
  SENTRY_DSN() {
    return process.env.REACT_APP_SENTRY_DSN.trim() ?? "";
  },
};

export default function env(name) {
  return ENV_VARS[name]();
}
