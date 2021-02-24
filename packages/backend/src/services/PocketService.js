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
import env from "environment";
import { PocketNetworkError } from "../models/Exceptions";

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

// Main
const POCKET_MAIN_FUND_ACCOUNT = POCKET_NETWORK_CONFIGURATION.main_fund_account;
const POCKET_MAIN_FUND_ADDRESS = POCKET_NETWORK_CONFIGURATION.main_fund_address;
// Free tier
const POCKET_FREE_TIER_FUND_ACCOUNT =
  POCKET_NETWORK_CONFIGURATION.free_tier.fund_account;
const POCKET_FREE_TIER_FUND_ADDRESS =
  POCKET_NETWORK_CONFIGURATION.free_tier.fund_address;

export const POKT_DENOMINATIONS = {
  pokt: 0,
  upokt: 6,
};

/**
 * Retrieve a list of URL's from the configuration for the dispatchers
 *
 * @returns {URL[]} Dispatcher urls.
 */
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
 * Retrieve a Pocket RPC Provider with the AAT and client account unlocked
 *
 * @async
 * @returns {PocketRpcProvider} Pocket RPC Provider with the AAT and client account unlocked
 */
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
 * @returns {HttpRpcProvider} HTTP RPC Provider.
 */
function getHttpRPCProvider() {
  const httpProviderNode = POCKET_NETWORK_CONFIGURATION.http_provider_node;

  if (!httpProviderNode || httpProviderNode === "") {
    throw new Error("Invalid HTTP Provider Node: " + httpProviderNode);
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
  } else if (providerType.toLowerCase() === "pocket") {
    return await getPocketRPCProvider();
  } else {
    // Default to HTTP RPC Provider
    return getHttpRPCProvider();
  }
}

export default class PocketService {
  constructor() {
    /**
     * @type {Pocket}
     * @private
     */
    this.__pocket = new Pocket(
      getPocketDispatchers(),
      undefined,
      POCKET_CONFIGURATION
    );
  }

  /**
   * Import an account to Pokt network using ppk  of the account.
   *
   * @param {object} ppkData ppk of the account to import in raw string.
   * @param {string} passphrase Passphrase used to generate the account.
   *
   * @returns {Promise<Account | Error>} A pocket account.
   */
  async importAccountFromPPK(ppkData, passphrase) {
    return await this.__pocket.keybase.importPPKFromJSON(
      passphrase,
      JSON.stringify(ppkData),
      passphrase
    );
  }

  /**
   * Import an account to Pokt network using a private key.
   *
   * @param {string} privateKey Private Key of the account to import.
   * @param {string} passphrase Passphrase used to generate the account.
   *
   * @returns {Promise<Account | Error>} A pocket account.
   */
  async importAccountFromPrivateKey(privateKey, passphrase) {
    return await this.__pocket.keybase.importAccount(
      Buffer.from(privateKey, "hex"),
      passphrase
    );
  }

  /**
   * Get Transaction data;
   *
   * @param {string} transactionHash Transaction hash.
   *
   * @returns {Transaction} Transaction data.
   * @async
   */
  async getTransaction(transactionHash) {
    const pocketRpcProvider = await getRPCProvider();
    const transactionResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .query.getTX(transactionHash);

    if (transactionResponse instanceof RpcError) {
      throw transactionResponse;
    }

    return transactionResponse.transaction;
  }
  /**
   * Creates a TransactionSenderObject to make operation requests over accounts.
   * Account must be previously saved on the keybase.
   *
   * @param {string} address - address of the account.
   * @param {string} passphrase - passphrase for the account.
   *
   * @returns {object} Transaction sender.
   */
  async _getTransactionSender(address, passphrase) {
    const account = await this.__pocket.keybase.getUnlockedAccount(
      address,
      passphrase
    );

    if (account instanceof Error) {
      throw account;
    }

    return await this.__pocket.withImportedAccount(
      account.addressHex,
      passphrase
    );
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
  async appStakeRequest(address, passphrase, chains, stakeAmount) {
    const {
      chain_id: chainID,
      transaction_fee: transactionFee,
    } = POCKET_NETWORK_CONFIGURATION;

    const transactionSender = await this._getTransactionSender(
      address,
      passphrase
    );
    const { unlockedAccount: account } = transactionSender;

    return await transactionSender
      .appStake(account.publicKey.toString("hex"), chains, stakeAmount)
      .createTransaction(chainID, transactionFee);
  }

  /**
   * Creates a transaction request to unstake an application.
   *
   * @param {string} address - Application address.
   * @param {string} passphrase - Application passphrase.
   *
   * @returns {Promise<{address:string, txHex:string}> | string} - A transaction sender.
   */
  async appUnstakeRequest(address, passphrase) {
    try {
      const {
        chain_id: chainID,
        transaction_fee: transactionFee,
      } = POCKET_NETWORK_CONFIGURATION;
      const transactionSender = await this._getTransactionSender(
        address,
        passphrase
      );

      return await transactionSender
        .appUnstake(address)
        .createTransaction(chainID, transactionFee);
    } catch (e) {
      return e.toString();
    }
  }

  /**
   * Check if account has sufficient balance.
   *
   * @param {string} accountAddress Account address to query.
   * @param {boolean} throwError If true throw the response error.
   *
   * @returns {Promise<string>} The account balance.
   * @async
   */
  async getBalance(accountAddress, throwError = true) {
    const pocketRpcProvider = await getRPCProvider();
    const accountQueryResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .query.getBalance(accountAddress);

    if (accountQueryResponse instanceof RpcError) {
      if (throwError) {
        throw accountQueryResponse;
      }

      return "0";
    }

    if (!accountQueryResponse.balance) {
      return "0";
    } else {
      return accountQueryResponse.balance.toString();
    }
  }

  /**
   * Get Application data.
   *
   * @param {string} addressHex Account address.
   * @param {boolean} throwError If true throw the response error.
   *
   * @returns {Application} The account data.
   * @throws {PocketNetworkError} If Query fails.
   * @async
   */
  async getApplication(addressHex, throwError = true) {
    const pocketRpcProvider = await getRPCProvider();
    const applicationResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .query.getApp(addressHex);

    if (applicationResponse instanceof RpcError) {
      if (throwError) {
        throw new PocketNetworkError(applicationResponse.message);
      }

      return undefined;
    }

    return applicationResponse.application;
  }

  /**
   * Get node data.
   *
   * @param {string} addressHex Account address.
   *
   * @returns {Node} The account data.
   * @throws {PocketNetworkError} If Query fails.
   * @async
   */
  async getNode(addressHex) {
    const pocketRpcProvider = await getRPCProvider();
    const nodeResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .query.getNode(addressHex);

    if (nodeResponse instanceof RpcError) {
      const error = new PocketNetworkError(nodeResponse.message);

      return error;
    }

    return nodeResponse.node;
  }

  /**
   * Get Applications data.
   *
   * @param {number} status Status of the apps to retrieve.
   *
   * @returns {Promise<Application[]>} The applications data.
   * @async
   */
  async getApplications(status) {
    let page = 1;
    let applicationList = [];

    const pocketRpcProvider = await getRPCProvider();
    const perPage = 100;
    const applicationsResponse = await this.__pocket
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
      const response = await this.__pocket
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
   * Get All applications data.
   *
   * @param {string[]} [appAddresses] Application addresses.
   *
   * @returns {Promise<Application[]>} The applications data.
   * @async
   */
  async getAllApplications(appAddresses = []) {
    const stakedApplications = await this.getApplications(StakingStatus.Staked);
    const unstakingApplications = await this.getApplications(
      StakingStatus.Unstaking
    );

    const allApplications = stakedApplications.concat(unstakingApplications);

    if (appAddresses === undefined) {
      return allApplications;
    }

    if (appAddresses.length > 0) {
      return allApplications.filter((app) =>
        appAddresses.includes(app.address)
      );
    }

    return [];
  }

  /**
   * Get Nodes data.
   *
   * @param {number} status Status of the nodes to retrieve.
   *
   * @returns {Promise<Node[]>} The nodes data.
   * @async
   */
  async getNodes(status) {
    let page = 1;
    let nodeList = [];

    const perPage = 100;
    const pocketRpcProvider = await getRPCProvider();
    const nodesResponse = await this.__pocket
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
      const response = await this.__pocket
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
   * Get All nodes data.
   *
   * @param {string[]} [nodeAddresses] Node addresses.
   *
   * @returns {Promise<Node[]>} The nodes data.
   * @async
   */
  async getAllNodes(nodeAddresses = []) {
    const stakedNodes = await this.getNodes(StakingStatus.Staked);
    const unstakingNodes = await this.getNodes(StakingStatus.Unstaking);

    const allNodes = stakedNodes.concat(unstakingNodes);

    if (nodeAddresses === undefined) {
      return allNodes;
    }

    if (nodeAddresses.length > 0) {
      return allNodes.filter((node) => nodeAddresses.includes(node.address));
    }

    return [];
  }

  /**
   * Get Application Parameters data.
   *
   * @returns {Promise<ApplicationParams>} The application parameters.
   * @throws {PocketNetworkError} If Query fails.
   * @async
   */
  async getApplicationParameters() {
    const pocketRpcProvider = await getRPCProvider();
    const applicationParametersResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .query.getAppParams();

    if (applicationParametersResponse instanceof RpcError) {
      throw new PocketNetworkError(applicationParametersResponse.message);
    }

    return applicationParametersResponse.applicationParams;
  }

  /**
   * Get Node Parameters data.
   *
   * @returns {Promise<NodeParams>} The node parameters.
   * @throws {PocketNetworkError} If Query fails.
   * @async
   */
  async getNodeParameters() {
    const pocketRpcProvider = await getRPCProvider();
    const nodeParametersResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .query.getNodeParams();

    if (nodeParametersResponse instanceof RpcError) {
      throw new PocketNetworkError(nodeParametersResponse.message);
    }

    return nodeParametersResponse.nodeParams;
  }

  async submitRawTransaction(fromAddress, rawTxBytes) {
    const pocketRpcProvider = await getRPCProvider();
    const rawTxResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .client.rawtx(fromAddress, rawTxBytes);

    if (typeGuard(rawTxResponse, RpcError)) {
      throw new PocketNetworkError(rawTxResponse.message);
    }

    return rawTxResponse.hash;
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
  async transferFromFreeTierFund(amount, customerAddress) {
    const {
      transaction_fee: transactionFee,
      chain_id: chainID,
    } = POCKET_NETWORK_CONFIGURATION;

    if (transactionFee && chainID && amount && customerAddress) {
      // Include transaction fee for the stake transaction
      const totalAmount = BigInt(Number(amount) + Number(transactionFee));

      if (totalAmount) {
        const pocketRpcProvider = await getRPCProvider();

        this.__pocket.rpc(pocketRpcProvider);

        const rawTxResponse = await this.__pocket
          .withPrivateKey(POCKET_FREE_TIER_FUND_ACCOUNT)
          .send(
            POCKET_FREE_TIER_FUND_ADDRESS,
            customerAddress,
            totalAmount.toString()
          )
          .submit(chainID, transactionFee);

        if (typeGuard(rawTxResponse, RpcError)) {
          throw new PocketNetworkError(rawTxResponse.message);
        }

        return rawTxResponse.hash;
      } else {
        throw new PocketNetworkError(
          "totalAmount is undefined, failed to tansfer funds for free tier staking."
        );
      }
    } else {
      throw new PocketNetworkError(
        "Failed to retrieve transactionFee and/or chainID and/or amount and/or customerAddress values."
      );
    }
  }
  /**
   * Transfer funds from the Main Fund Account to the customer's Account.
   *
   * @param {string} amount Amount to transfer in uPOKT denomination.
   * @param {string} customerAddress Recipient address.
   *
   * @returns {Promise<string>} The transaction hash.
   * @throws {PocketNetworkError}
   */
  async transferFromMainFund(amount, customerAddress) {
    const {
      transaction_fee: transactionFee,
      chain_id: chainID,
    } = POCKET_NETWORK_CONFIGURATION;

    if (transactionFee && chainID && amount && customerAddress) {
      // Include both transaction fees for stake and unstake
      const totalAmount = BigInt(Number(amount) + 1000000);

      if (totalAmount) {
        const pocketRpcProvider = await getRPCProvider();

        this.__pocket.rpc(pocketRpcProvider);

        const rawTxResponse = await this.__pocket
          .withPrivateKey(POCKET_MAIN_FUND_ACCOUNT)
          .send(
            POCKET_MAIN_FUND_ADDRESS,
            customerAddress,
            totalAmount.toString()
          )
          .submit(chainID, transactionFee);

        if (typeGuard(rawTxResponse, RpcError)) {
          throw new PocketNetworkError(rawTxResponse.message);
        }

        return rawTxResponse.hash;
      } else {
        throw new PocketNetworkError(
          "totalAmount is undefined, failed to tansfer funds for free tier staking."
        );
      }
    } else {
      throw new PocketNetworkError(
        "Failed to retrieve transactionFee and/or chainID and/or amount and/or customerAddress values."
      );
    }
  }

  /**
   * Create an unlock account.
   *
   * @param {string} passphrase New account's passphrase.
   *
   * @returns {Promise<UnlockedAccount>} The unlocked account.
   * @throws {PocketNetworkError}
   */
  async createUnlockedAccount(passphrase) {
    const account = await this.__pocket.keybase.createAccount(passphrase);
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

  async getBlockHeight() {
    const pocketRpcProvider = await getRPCProvider();
    const heightResponse = await this.__pocket
      .rpc(pocketRpcProvider)
      .query.getHeight();

    if (typeGuard(heightResponse, RpcError)) {
      throw new PocketNetworkError(heightResponse.message);
    }

    return heightResponse.height;
  }
}
