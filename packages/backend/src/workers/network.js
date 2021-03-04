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
import NetworkData from "models/NetworkData";
import Blockchains from "models/Blockchains";
import env from "environment";

function getPocketDispatchers() {
  const dispatchersStr = POCKET_NETWORK_CONFIGURATION.dispatchers;

  if (dispatchersStr === "") {
    return [];
  }

  return dispatchersStr.split(",").map(function (dispatcherURLStr) {
    return new URL(dispatcherURLStr);
  });
}

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

const pocketInstance = new Pocket(
  getPocketDispatchers(),
  undefined,
  POCKET_CONFIGURATION
);

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
async function getNodes(status) {
  let page = 1;
  let nodeList = [];

  const perPage = 100;
  const pocketRpcProvider = await getRPCProvider();
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
async function getApplications(status) {
  let page = 1;
  let applicationList = [];

  const pocketRpcProvider = await getRPCProvider();
  const perPage = 100;
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

async function getTotalNodesStaked() {
  const stakedNodes = await getNodes(StakingStatus.Staked);

  if (!stakedNodes || stakedNodes?.length === 0) {
    throw new Error("PocketJS failed to retrieve staked nodes");
  }

  return stakedNodes.length;
}

async function getTotalAppsStaked() {
  const stakedApps = await getApplications(StakingStatus.Staked);

  if (!stakedApps || stakedApps?.length === 0) {
    throw new Error("PocketJS failed to retrieve staked apps");
  }

  return stakedApps.length;
}

async function getTotalPoktStaked() {
  const stakedNodes = await getNodes(StakingStatus.Staked);
  const stakedApps = await getApplications(StakingStatus.Staked);

  const totalNodePoktStaked = stakedNodes.reduce(
    (prev, cur) => prev + cur.stakedTokens,
    0n
  );
  const totalAppPoktStaked = stakedApps.reduce(
    (prev, cur) => prev + cur.stakedTokens,
    0n
  );

  return BigInt(totalNodePoktStaked + totalAppPoktStaked);
}

export async function getNetworkStatsCount() {
  const totalNodesStaked = await getTotalNodesStaked();
  const totalAppsStaked = await getTotalAppsStaked();
  const totalPoktStaked = await getTotalPoktStaked();

  const networkStats = new NetworkData({
    nodesStaked: totalNodesStaked,
    appsStaked: totalAppsStaked,
    poktStaked: totalPoktStaked.toString(),
    createdAt: new Date(Date.now()),
  });

  await networkStats.save();
}

export async function getNodeCountForChains() {
  const chainNodeCounter = new Map();
  const stakedNodes = await getNodes(StakingStatus.Staked);

  if (!stakedNodes) {
    throw new Error("pocketJS failed when fetching nodes");
  }

  for (const { chains } of stakedNodes) {
    for (const chainId of chains) {
      if (!chainNodeCounter.has(chainId)) {
        chainNodeCounter.set(chainId, 0);
      } else {
        const currentCount = Number(chainNodeCounter.get(chainId));

        chainNodeCounter.set(chainId, currentCount + 1);
      }
    }
  }

  chainNodeCounter.forEach(async function updateChainCount(count, id) {
    const blockchain = await Blockchains.findById(id);

    if (!blockchain) {
      // TODO: Add logger through dep injection to signal a non-registered chain
      return;
    }

    blockchain.nodeCount = count;
    await blockchain.save();
  });
}
