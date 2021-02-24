import BasePocketService from "./BasePocketService";
import env from "environment";
import { Application, Node, StakingStatus } from "@pokt-network/pocket-js";
import { NetworkSummaryData, NetworkChain } from "../models/Network";
import bigInt from "big-integer";

const NETWORK_COLLECTION_NAME = "Blockchains";

export default class NetworkService extends BasePocketService {
  /**
   * Get all blockchains available to stake
   *
   * @returns {Promise<NetworkChain[]>} List of applications.
   * @async
   */
  async getAvailableNetworkChains() {
    const filter = { active: true };
    const networkChainData = await this.persistenceService.getEntities(
      NETWORK_COLLECTION_NAME,
      filter,
      1000,
      0
    );

    if (networkChainData.length > 0) {
      return networkChainData.sort(function (a, b) {
        return parseInt(a._id, 16) - parseInt(b._id, 16);
      });
    }

    return [];
  }

  /**
   * Get Network chains from hashes.
   *
   * @param {string[]} networkHashes Network hashes.
   *
   * @returns {Promise<NetworkChain[]>} List of applications.
   * @async
   */
  async getNetworkChains(networkHashes) {
    if (networkHashes === undefined) {
      return [];
    } else {
      const filter = { active: true, _id: networkHashes };

      const networkChainData = await this.persistenceService.getEntities(
        NETWORK_COLLECTION_NAME,
        filter,
        1000,
        0
      );

      if (networkChainData) {
        networkHashes.push(networkChainData);
      }

      if (networkChainData.length > 0) {
        return networkChainData;
      }

      return [];
    }
  }

  /**
   * Get the POKT price.
   *
   * @returns {string} POKT price.
   * @private
   */
  __getPOKTPrice() {
    return env("pocket_network").pokt_market_price;
  }

  /**
   * Get Staked nodes.
   *
   * @returns {Promise<Node[]>} Staked node information.
   * @async
   * @private
   */
  async __getStakedNodes() {
    return this.pocketService.getNodes(StakingStatus.Staked);
  }

  /**
   * Get staked applications.
   *
   * @returns {Promise<Application[]>} Staked application information.
   * @async
   * @private
   */
  async __getStakedApplications() {
    return this.pocketService.getApplications(StakingStatus.Staked);
  }

  /**
   * Get total staked tokens.
   *
   * @param {Application[]} totalStakedApps Staked applications.
   * @param {Node[]} totalStakedNodes Staked nodes.
   *
   * @returns {*} Total staked tokens.
   * @private
   */
  __totalStakedTokens(totalStakedApps, totalStakedNodes) {
    const totalStakedAppTokens = this._getTotalNetworkData(
      totalStakedApps.map((app) => bigInt(app.stakedTokens))
    );
    const totalStakedNodeTokens = this._getTotalNetworkData(
      totalStakedNodes.map((node) => bigInt(node.stakedTokens))
    );

    return totalStakedAppTokens.add(totalStakedNodeTokens);
  }

  /**
   * Get Summary data from network.
   *
   * @returns {Promise<NetworkSummaryData>} Summary network data.
   * @async
   */
  async getNetworkSummaryData() {
    const poktPrice = this.__getPOKTPrice();
    const stakedApplications = await this.__getStakedApplications();
    const stakedNodes = await this.__getStakedNodes();
    const totalStakedTokens = this.__totalStakedTokens(
      stakedApplications,
      stakedNodes
    );

    return new NetworkSummaryData(
      poktPrice,
      totalStakedTokens,
      stakedNodes.length.toString(),
      stakedApplications.length.toString()
    );
  }
}
