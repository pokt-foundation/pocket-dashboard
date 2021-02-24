import { before, describe, it } from "mocha";
import { assert } from "chai";
import { configureTestService } from "../setupTests";
import AccountService from "../../src/services/AccountService";

/** @type {string} */
const APPLICATION_ACCOUNT_IN_NETWORK =
  process.env.TEST_APPLICATION_ACCOUNT_IN_NETWORK;

const accountService = new AccountService();

before(() => {
  configureTestService(accountService);
});

describe("AccountService", () => {
  if (APPLICATION_ACCOUNT_IN_NETWORK) {
    describe("getBalance", () => {
      it("Expect an account balance", async () => {
        const balance = await accountService.getBalance(
          APPLICATION_ACCOUNT_IN_NETWORK
        );

        assert.isDefined(balance);
        assert.isNumber(balance);
      });
    });
  }
});
