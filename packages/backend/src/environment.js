import dotenv from "dotenv";
dotenv.config();

export const ENV_VARS = {
  prod() {
    return process.env.NODE_ENV === "production";
  },
  frontend_url() {
    return process.env.FRONTEND_URL || "http://localhost:3000";
  },
  auth() {
    return {
      public_secret: process.env.JWT_PUBLIC_SECRET.replace(/\\n/gm, "\n"),
      private_secret: process.env.JWT_PRIVATE_SECRET.replace(/\\n/gm, "\n"),
      secret_key: process.env.JWT_SECRET_KEY,
      expiration: process.env.JWT_EXPIRATION,
      refresh_expiration: process.env.JWT_REFRESH_EXPIRATION,
    };
  },
  email() {
    return {
      api_key: process.env.EMAIL_API_KEY,
      from_email: process.env.EMAIL_FROM,
      template_ids: {
        SignUp: "d-23cc7c71b2d54b26bd09889f72fe0dc9",
        ResetPassword: "d-a54f3a2f7f784545bb3d3f0106a40a87",
      },
    };
  },
  persistence() {
    return {
      default: {
        url: process.env.DATABASE_URL,
        db_name: process.env.DATABASE_NAME,
        db_encryption_key: process.env.DATABASE_ENCRYPTION_KEY,
        options: {
          useUnifiedTopology: true,
        },
      },
      test: {
        url: "mongodb://localhost:27017",
        db_name: "pocket_dashboard_test",
        db_encryption_key: process.env.DATABASE_ENCRYPTION_KEY,
        options: {
          useUnifiedTopology: true,
        },
      },
    };
  },
  pocket_network() {
    return {
      aat_version: process.env.POCKET_NETWORK_AAT_VERSION,
      transaction_fee: process.env.POCKET_NETWORK_TRANSACTION_FEE,
      chain_id: process.env.POCKET_NETWORK_CHAIN_ID,
      max_dispatchers: process.env.POCKET_NETWORK_MAX_DISPATCHER,
      request_timeout: process.env.POCKET_NETWORK_REQUEST_TIMEOUT,
      max_sessions: process.env.POCKET_NETWORK_MAX_SESSIONS,
      free_tier: {
        stake_amount: process.env.POCKET_FREE_TIER_STAKE_AMOUNT,
        max_relay_per_day_amount:
          process.env.POCKET_FREE_TIER_MAX_RELAY_PER_DAY_AMOUNT,
        fund_account: process.env.POCKET_NETWORK_FREE_TIER_FUND_ACCOUNT,
        fund_address: process.env.POCKET_NETWORK_FREE_TIER_FUND_ADDRESS,
        client_pub_key: process.env.POCKET_NETWORK_CLIENT_PUB_KEY,
      },
      dispatchers: process.env.POCKET_NETWORK_DISPATCHERS,
      chain_hash: process.env.POCKET_NETWORK_CHAIN_HASH,
      provider_type: process.env.POCKET_NETWORK_PROVIDER_TYPE,
      http_provider_node: process.env.POCKET_NETWORK_HTTP_PROVIDER_NODE,
      main_fund_account: process.env.POCKET_NETWORK_MAIN_FUND_ACCOUNT,
      main_fund_address: process.env.POCKET_NETWORK_MAIN_FUND_ADDRESS,
    };
  },
  recaptcha() {
    return {
      google_server: process.env.RECAPTCHA_SERVER_SECRET,
    };
  },
  aws() {
    return {
      access_key_id: process.env.AWS_ACCESS_KEY_ID,
      secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      s3_fts_bucket: process.env.AWS_S3_FTS_BUCKET,
    };
  },
};

/**
 * Returns the corresponding object for the named passed
 *
 * @param {string} name name of the environment block
 *
 * @returns {object} object with scoped environment variables
 *
 */
export default function env(name) {
  return ENV_VARS[name]();
}
