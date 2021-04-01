/* global BigInt */
import {
  Application,
  Configuration,
  HttpRpcProvider,
  Node,
  Pocket,
  PocketRpcProvider,
  RpcError,
  typeGuard,
  UnlockedAccount,
  PocketAAT,
} from "@pokt-network/pocket-js";
import env from "environment";

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
  const dispatchers = POCKET_NETWORK_CONFIGURATION.dispatchers;

  if (dispatchers === "") {
    return [];
  }

  return dispatchers.split(",").map(function (dispatcherUri) {
    return new URL(dispatcherUri);
  });
}

/**
 * @returns {HttpRpcProvider} HTTP RPC Provider.
 */
function getHttpRPCProvider() {
  const httpProviderNode = POCKET_NETWORK_CONFIGURATION.http_provider_node;

  if (!httpProviderNode || httpProviderNode === "") {
    throw new Error(`Invalid HTTP Provider Node: ${httpProviderNode}`);
  }
  return new HttpRpcProvider(new URL(httpProviderNode));
}

/**
 * @returns {HttpRpcProvider | PocketRpcProvider} RPC Provider.
 */
async function getRPCProvider() {
  const providerType = POCKET_NETWORK_CONFIGURATION.provider_type;

  if (providerType.toLowerCase() === "http") {
    return getHttpRPCProvider();
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

  if (applicationsResponse instanceof RpcError) {
    return [];
  }

  const totalPages = applicationsResponse.totalPages;

  while (page <= totalPages) {
    const response = await pocketInstance
      .rpc(pocketRpcProvider)
      .query.getApps(status, BigInt(0), undefined, page, perPage);

    page++;

    if (response instanceof RpcError) {
      page = totalPages;
      return;
    }

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

  pocketInstance.rpc(pocketRpcProvider);

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
  const unlockedAccountOrError = await pocketInstance.keybase.getUnlockedAccount(
    account.addressHex,
    passphrase
  );

  if (typeGuard(unlockedAccountOrError, Error)) {
    throw new Error(unlockedAccountOrError.message);
  } else if (typeGuard(unlockedAccountOrError, UnlockedAccount)) {
    return unlockedAccountOrError;
  } else {
    throw new Error("Unknown error while creating an unlocked account");
  }
}

export async function getBalance(addressHex) {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  const pocketRpcProvider = await getRPCProvider();

  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getBalance(addressHex);

  return applicationResponse;
}

export async function getTX(addressHex) {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  const pocketRpcProvider = await getRPCProvider();

  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getTX(addressHex);

  return applicationResponse;
}

export async function getAccount(addressHex) {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  const pocketRpcProvider = await getRPCProvider();

  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getAccount(addressHex);

  return applicationResponse;
}

export async function getApp(addressHex) {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  const pocketRpcProvider = await getRPCProvider();

  const applicationResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .query.getApp(addressHex);

  return applicationResponse;
}

/**
 * Creates a transaction request to stake an application.
 *
 * @param {string} address - Application address.
 * @param {string} passphrase - Application passphrase.
 * @param {string[]} chains - Network identifier list to be requested by this app.
 * @param {string} stakeAmount - the amount to stake, must be greater than 0.
 *
 * @returns {Promise<{address:string, txHex:string} | string>} - A transaction sender.
 */
export async function createAppStakeTx(
  address,
  passphrase,
  privateKey,
  chains,
  stakeAmount
) {
  const {
    chain_id: chainID,
    transaction_fee: transactionFee,
  } = POCKET_NETWORK_CONFIGURATION;

  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );

  const unlockedAccount = await pocketInstance.keybase.importAccount(
    privateKey,
    passphrase
  );

  if (unlockedAccount instanceof Error) {
    throw unlockedAccount;
  }

  const senderAccount = await pocketInstance.withImportedAccount(
    unlockedAccount.addressHex,
    passphrase
  );

  const { unlockedAccount: account } = senderAccount;

  return await senderAccount
    .appStake(account.publicKey.toString("hex"), chains, stakeAmount.toString())
    .createTransaction(chainID, transactionFee);
}

export async function getPocketInstance() {
  return new Pocket(getPocketDispatchers(), undefined, POCKET_CONFIGURATION);
}

export async function submitRawTransaction(fromAddress, rawTxBytes) {
  const pocketInstance = new Pocket(
    getPocketDispatchers(),
    undefined,
    POCKET_CONFIGURATION
  );
  const pocketRpcProvider = await getRPCProvider();
  const rawTxResponse = await pocketInstance
    .rpc(pocketRpcProvider)
    .client.rawtx(fromAddress, rawTxBytes);

  if (typeGuard(rawTxResponse, RpcError)) {
    throw new Error(rawTxResponse.message);
  }

  return rawTxResponse.hash;
}
