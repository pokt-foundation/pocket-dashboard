import { PublicPocketAccount } from "../models/Account";
import { CoinDenom } from "@pokt-network/pocket-js";
import { POKT_DENOMINATIONS } from "./PocketService";
import env from "environment";
import BasePocketService from "./BasePocketService";

export default class AccountService extends BasePocketService {
  /**
   * Import account into network.
   *
   * @param {object} ppkData Account private key.
   * @param {string} passphrase Passphrase of account.
   *
   * @returns {Promise<PublicPocketAccount>} a pocket account.
   * @throws Error If account is invalid.
   * @async
   */
  async importDashboardAccountToNetworkFromPPK(ppkData, passphrase) {
    const applicationAccount = await this.pocketService.importAccountFromPPK(
      ppkData,
      passphrase
    );

    if (applicationAccount instanceof Error) {
      throw TypeError("Account is invalid");
    }

    return PublicPocketAccount.createPublicPocketAccount(applicationAccount);
  }

  /**
   * Get POKT balance of account
   *
   * @param {string} accountAddress Account address to get balance.
   *
   * @returns {Promise<number>} Account balance.
   * @async
   */
  async getPoktBalance(accountAddress) {
    const balance = await this.pocketService.getBalance(accountAddress);

    return parseInt(balance);
  }

  /**
   * Get the usd balance of an account
   *
   * @param {string} accountAddress Account address to get balance.
   * @param {CoinDenom} pocketDenomination Pocket denomination.
   *
   * @returns {Promise<number>} Account balance.
   * @async
   */
  async getBalance(accountAddress, pocketDenomination = CoinDenom.Upokt) {
    const { pokt_market_price: poktMarketPrice } = env("pocket_network");
    const upokt = await this.getPoktBalance(accountAddress);
    const usd =
      (upokt / Math.pow(10, POKT_DENOMINATIONS[pocketDenomination])) *
      poktMarketPrice;

    return { upokt, usd };
  }
}
