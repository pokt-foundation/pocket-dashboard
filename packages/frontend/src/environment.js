const ENV_VARS = {
  BACKEND_URL() {
    return process.env.REACT_APP_BACKEND_URL ?? "";
  },
  BUILD() {
    return process.env.REACT_APP_BUILD ?? "undefined";
  },
  ENABLE_A11Y() {
    return process.env.REACT_APP_ENABLE_A11Y ?? false;
  },
  HASURA_URL() {
    return process.env.REACT_APP_HASURA_URL ?? "";
  },
  PROD() {
    return process.env.NODE_ENV === "production";
  },
  SENTRY_DSN() {
    return process.env.REACT_APP_SENTRY_DSN?.trim() ?? "";
  },
};

export default function env(name) {
  return ENV_VARS[name]();
}
