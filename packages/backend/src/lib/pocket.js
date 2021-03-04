/* global BigInt */
import {
  Account,
  Application,
  ApplicationParams,
  Configuration,
  HttpRpcProvider,
  Node,
  NodeParams,
  Pocket,
  PocketRpcProvider,
  RpcError,
  StakingStatus,
  Transaction,
  typeGuard,
  UnlockedAccount,
  PocketAAT,
} from "@pokt-network/pocket-js";
import env from 'environment'

const POCKET_NETWORK_CONFIGURATION = env("pocket_network");

const POCKET_CONFIGURATION = new Configuration(
  POCKET_NETWORK_CONFIGURATION.max_dispatchers,
  POCKET_NETWORK_CONFIGURATION.max_sessions,
  0,
  POCKET_NETWORK_CONFIGURATION.request_timeout,
  undefined,
  undefined,
  POCKET_NETWORK_CONFIGURATION.block_time,
  undefined,
  undefined,
  POCKET_NETWORK_CONFIGURATION.reject_self_signed_certificates
);

const POCKET_FREE_TIER_FUND_ACCOUNT =
  POCKET_NETWORK_CONFIGURATION.free_tier.fund_account;
const POCKET_FREE_TIER_FUND_ADDRESS =
  POCKET_NETWORK_CONFIGURATION.free_tier.fund_address;

export const POKT_DENOMINATIONS = {
  pokt: 0,
  upokt: 6,
};

function getPocketDispatchers() {
  const dispatchersStr = POCKET_NETWORK_CONFIGURATION.dispatchers;

  if (dispatchersStr === "") {
    return [];
  }

  return dispatchersStr.split(",").map(function (dispatcherURLStr) {
    return new URL(dispatcherURLStr);
  });
}

/**
 * @returns {HttpRpcProvider} HTTP RPC Provider.
 */
function getHttpRPCProvider() {
  const httpProviderNode = POCKET_NETWORK_CONFIGURATION.http_provider_node;

  if (!httpProviderNode || httpProviderNode === "") {
    throw new Error("Invalid HTTP Provider Node: " + httpProviderNode);
  }
  return new HttpRpcProvider(new URL(httpProviderNode));
}

async function getPocketRPCProvider() {
  const chain = POCKET_NETWORK_CONFIGURATION.chain_hash;
  const clientPubKeyHex = POCKET_NETWORK_CONFIGURATION.client_pub_key;
  const clientPrivateKey = POCKET_NETWORK_CONFIGURATION.client_priv_key;
  const clientPassphrase = POCKET_NETWORK_CONFIGURATION.client_passphrase;
  const appPublicKey = POCKET_NETWORK_CONFIGURATION.app_pub_key;
  const appSignature = POCKET_NETWORK_CONFIGURATION.app_signature;

  // Pocket instance
  const pocket = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  // Import client Account
  const clientAccountOrError = await pocket.keybase.importAccount(
    Buffer.from(clientPrivateKey, "hex"),
    clientPassphrase
  );

  if (typeGuard(clientAccountOrError, Error)) {
    throw clientAccountOrError;
  }
  // Unlock the client account
  const unlockOrError = await pocket.keybase.unlockAccount(
    clientAccountOrError.addressHex,
    clientPassphrase,
    0
  );

  if (typeGuard(unlockOrError, Error)) {
    throw clientAccountOrError;
  }

  // Generate the AAT
  const aat = new PocketAAT(
    POCKET_NETWORK_CONFIGURATION.aat_version,
    clientPubKeyHex,
    appPublicKey,
    appSignature
  );
  // Pocket Rpc Instance
  const pocketRpcProvider = new PocketRpcProvider(
    pocket,
    aat,
    chain,
    POCKET_NETWORK_CONFIGURATION.enable_consensus_relay
  );

  return pocketRpcProvider;
}

/**
 * @returns {HttpRpcProvider | PocketRpcProvider} RPC Provider.
 */
async function getRPCProvider() {
  const providerType = POCKET_NETWORK_CONFIGURATION.provider_type;

  if (providerType.toLowerCase() === "http") {
    return getHttpRPCProvider();
  } else if (providerType.toLowerCase() === "pocket") {
    return await getPocketRPCProvider();
  } else {
    // Default to HTTP RPC Provider
    return getHttpRPCProvider();
  }
}

/**
 * Get Nodes data.
 *
 * @param {number} status Status of the nodes to retrieve.
 *
 * @returns {Promise<Node[]>} The nodes data.
 * @async
 */
export async function getNodes(status) {
  let page = 1;
  let nodeList = [];

  const perPage = 100;
  const pocketRpcProvider = await getRPCProvider();
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );
  const nodesResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getNodes(status, undefined, BigInt(0), undefined, page, perPage);

  if (nodesResponse instanceof RpcError) {
    return [];
  }

  const totalPages = nodesResponse.totalPages;

  nodesResponse.nodes.forEach((node) => {
    nodeList.push(node);
  });

  page++;

  while (page <= totalPages) {
    const response = await pocketInstance
      .rpc(pocketRpcProvider)
      .query.getNodes(status, undefined, BigInt(0), undefined, page, perPage);

    // Increment page variable
    page++;

    if (response instanceof RpcError) {
      page = totalPages;
      return;
    }

    response.nodes.forEach((node) => {
      nodeList.push(node);
    });
  }

  return nodesResponse.nodes;
}

/**
 * Get Applications data.
 *
 * @param {number} status Status of the apps to retrieve.
 *
 * @returns {Promise<Application[]>} The applications data.
 * @async
 */
export async function getApplications(status) {
  let page = 1;
  let applicationList = [];

  const pocketRpcProvider = await getRPCProvider();
  const perPage = 100;
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  const applicationsResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getApps(status, BigInt(0), undefined, page, perPage);

  // Check for RpcError
  if (applicationsResponse instanceof RpcError) {
    return [];
  }

  // Retrieve the total pages count
  const totalPages = applicationsResponse.totalPages;

  // Retrieve the app list
  while (page <= totalPages) {
    const response = await pocketInstance
      .rpc(pocketRpcProvider)
      .query.getApps(status, BigInt(0), undefined, page, perPage);

    // Increment page variable
    page++;

    // Check for error
    if (response instanceof RpcError) {
      page = totalPages;
      return;
    }
    // Add the result to the application list
    response.applications.forEach((app) => {
      applicationList.push(app);
    });
  }

  return applicationList;
}

/**
 * Transfer funds from the Free tier Fund Account to the private pocket Account.
 *
 * @param {string} amount Amount to transfer in uPOKT denomination.
 * @param {string} customerAddress Recipient address.
 *
 * @returns {Promise<string>} The transaction hash.
 * @throws {PocketNetworkError}
 */
export async function transferFromFreeTierFund(amount, customerAddress) {
  const {
    transaction_fee: transactionFee,
    chain_id: chainID,
  } = POCKET_NETWORK_CONFIGURATION;

  if (!transactionFee) {
    throw new Error("Can't transfer from free tier: transaction fee missing");
  }

  if (!chainID) {
    throw new Error("Can't transfer from free tier: chainID missing");
  }

  if (!amount) {
    throw new Error("Can't transfer from free tier: no amount provided");
  }

  if (!customerAddress) {
    throw new Error(
      "Can't transfer from free tier: no customer address provided"
    );
  }

  // Include transaction fee for the stake transaction
  const totalAmount = BigInt(Number(amount) + Number(transactionFee));

  if (!totalAmount) {
    throw "Can't transfer from free tier: failed to calculate totalAmount";
  }

  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  const pocketRpcProvider = await getRPCProvider();

  this.__pocket.rpc(pocketRpcProvider);

  const rawTxResponse = await pocketInstance
    .withPrivateKey(POCKET_FREE_TIER_FUND_ACCOUNT)
    .send(
      POCKET_FREE_TIER_FUND_ADDRESS,
      customerAddress,
      totalAmount.toString()
    )
    .submit(chainID, transactionFee);

  if (typeGuard(rawTxResponse, RpcError)) {
    throw new Error(rawTxResponse.message);
  }

  return rawTxResponse.hash;
}

/**
 * Create an unlocked (ready-to-use) account.
 *
 * @param {string} passphrase New account's passphrase.
 *
 * @returns {Promise<UnlockedAccount>} The unlocked account.
 * @throws {PocketNetworkError}
 */
export async function createUnlockedAccount(passphrase) {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );
  const account = await pocketInstance.keybase.createAccount(passphrase);
  const unlockedAccountOrError = await this.__pocket.keybase.getUnlockedAccount(
    account.addressHex,
    passphrase
  );

  if (typeGuard(unlockedAccountOrError, Error)) {
    throw new PocketNetworkError(unlockedAccountOrError.message);
  } else if (typeGuard(unlockedAccountOrError, UnlockedAccount)) {
    return unlockedAccountOrError;
  } else {
    throw new PocketNetworkError(
      "Unknown error while creating an unlocked account"
    );
  }
}
