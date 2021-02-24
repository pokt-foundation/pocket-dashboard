import { before, describe, it } from "mocha";
import "chai/register-should";
import { Configurations } from "../../src/_configuration";
import {
  PaymentCurrencies,
  PaymentTypes,
} from "../../src/providers/payment/BasePaymentProvider";
import PaymentService from "../../src/services/PaymentService";
import { configureTestService } from "../setupTests";
import { PaymentHistory, PaymentMethod } from "../../src/models/Payment";

const paymentService = new PaymentService();

before(() => {
  configureTestService(paymentService);
});

describe("PaymentService", () => {
  describe("getAvailableCurrencies", () => {
    it("List of available currencies", () => {
      const currencies = paymentService.getAvailableCurrencies();

      // eslint-disable-next-line no-undef
      should.exist(currencies);

      currencies.should.be.an("array");
    });
  });

  describe("savePaymentMethod", () => {
    it("Save a payment method without error", async () => {
      const paymentMethodData = {
        user: "tester@testing.com",
        id: "paymentMethodTestID",
        billingDetails: {
          name: "Tester",
          address: {
            line1: "Test billing detail",
            postal_code: "Test postal code",
            country: "TE",
          },
        },
      };

      const saved = await paymentService.savePaymentMethod(paymentMethodData);

      // eslint-disable-next-line no-undef
      should.exist(saved);

      saved.should.be.equal(true);
    });
  });

  describe("paymentMethodExists", () => {
    it("Expect a true value", async () => {
      const paymentMethodData = {
        user: "tester@testing.com",
        id: "paymentMethodTestID",
        billingDetails: {
          name: "Tester",
          address: {
            line1: "Test billing detail",
            postal_code: "Test postal code",
            country: "TE",
          },
        },
      };

      const paymentMethod = PaymentMethod.createPaymentMethod(
        paymentMethodData
      );
      const exists = await paymentService.paymentMethodExists(paymentMethod);

      exists.should.be.true;
    });
  });

  describe("deletePaymentMethod", () => {
    it("Expect a true value", async () => {
      const id = "paymentMethodTestID";
      const deleted = await paymentService.deletePaymentMethod(id);

      deleted.should.be.true;
    });
  });

  describe("savePaymentHistory", () => {
    it("Save a payment history without error", async () => {
      const user = "tester@testing.com";
      const createdDate = "2020-05-08T00:00:00.000Z";
      const paymentID = "paymentMethodTestID";
      const currency = "usd";
      const amount = 1000;
      const item = {
        account: "b9628a13220f049b93fdefe4fb9ca2bca10fe460",
        name: "My App",
        pokt: "346",
      };

      const saved = await paymentService.savePaymentHistory(
        createdDate,
        paymentID,
        currency,
        amount,
        item,
        user
      );

      // eslint-disable-next-line no-undef
      should.exist(saved);

      saved.should.be.equal(true);
    });
  });

  describe("paymentHistoryExists", () => {
    it("Expect a true value", async () => {
      const paymentHistoryData = {
        user: "tester@testing.com",
        createdDate: "2020-05-08T00:00:00.000Z",
        paymentID: "paymentMethodTestID",
        currency: "usd",
        amount: 1000,
        item: {
          account: "b9628a13220f049b93fdefe4fb9ca2bca10fe460",
          name: "My App",
          maxRelay: "3243",
          pokt: "346",
        },
      };

      const paymentHistory = PaymentHistory.createPaymentHistory(
        paymentHistoryData
      );
      const exists = await paymentService.paymentHistoryExists(paymentHistory);

      exists.should.be.true;
    });
  });

  describe("getPaymentHistory", () => {
    it("Expect a list of payments", async () => {
      const user = "tester@testing.com";
      const limit = 10;

      const paymentHistory = await paymentService.getPaymentHistory(
        user,
        limit
      );

      paymentHistory.should.be.an("array");
      paymentHistory.length.should.be.greaterThan(0);
    });
  });

  describe("getPaymentHistory with fromDate toDate", () => {
    it("Expect a record of a payment", async () => {
      const user = "tester@testing.com";
      const limit = 10;
      const offset = 0;
      const fromDate = "2020-05-08";
      const toDate = "2020-05-08";

      const paymentHistory = await paymentService.getPaymentHistory(
        user,
        limit,
        offset,
        fromDate,
        toDate
      );

      paymentHistory.should.be.an("array");
      paymentHistory.length.should.be.equal(1);
    });
  });

  describe("getPaymentHistoryByID", () => {
    it("Expect a payment", async () => {
      const paymentMethodID = "paymentMethodTestID";

      const paymentHistory = await paymentService.getPaymentFromHistory(
        paymentMethodID
      );

      paymentHistory.should.be.an("object");
    });
  });

  describe("markPaymentAsSuccess", () => {
    it("Expect a true value", async () => {
      const paymentHistoryData = {
        user: "tester@testing.com",
        paymentID: "paymentMethodTestID",
        paymentMethodID: "paymentMethodTestID",
        billingDetails: {
          name: "Tester",
          address: {
            line1: "Test billing detail",
            postal_code: "Test postal code",
            country: "TE",
          },
        },
      };

      const exists = await paymentService.markPaymentAsSuccess(
        paymentHistoryData
      );

      exists.should.be.equal(true);
    });
  });

  if (
    Configurations.payment.test.client_id &&
    Configurations.payment.test.client_secret
  ) {
    describe("createPaymentIntent for apps that don’t require authentication", () => {
      it.skip("Create a Payment with amount, currency and type successfully", async () => {
        const type = PaymentTypes.card;
        const currency = PaymentCurrencies.usd;
        const item = {
          account: "b9628a13220f049b93fdefe4fb9ca2bca10fe460",
          name: "My App",
          pokt: "346",
        };
        const amount = 90;

        const paymentResult = await paymentService.createPocketPaymentIntentForApps(
          type,
          currency,
          item,
          amount
        );

        // eslint-disable-next-line no-undef
        should.exist(paymentResult);

        paymentResult.should.be.an("object");
        paymentResult.paymentNumber.should.be.a("string");
      });
    });

    describe("createPaymentIntent for nodes that don’t require authentication", () => {
      it.skip("Create a Payment with amount, currency and type successfully", async () => {
        const type = PaymentTypes.card;
        const currency = PaymentCurrencies.usd;
        const item = {
          account: "b9628a13220f049b93fdefe4fb9ca2bca10fe460",
          name: "My Node",
          pokt: "346",
        };
        const amount = 90;

        const paymentResult = await paymentService.createPocketPaymentIntentForNodes(
          type,
          currency,
          item,
          amount
        );

        // eslint-disable-next-line no-undef
        should.exist(paymentResult);

        paymentResult.should.be.an("object");
        paymentResult.paymentNumber.should.be.a("string");
      });
    });
  }
});
