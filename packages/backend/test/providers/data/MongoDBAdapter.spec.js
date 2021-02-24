import { describe, it } from "mocha";
import "chai/register-should";

import { Configurations } from "../../../src/_configuration";
import MongoDBAdapter from "../../../src/providers/data/db/MongoDBAdapter";

const mongoDBProvider = new MongoDBAdapter(Configurations.persistence.test);

describe("MongoDBAdapter", () => {
  describe("open", () => {
    it("Expected a successfully connection", async () => {
      const connection = await mongoDBProvider.open();

      // eslint-disable-next-line no-undef
      should.exist(connection);

      connection.isConnected().should.equal(true);

      mongoDBProvider.close(connection);
    });
  });

  describe("close", () => {
    it("Expected close successfully", async () => {
      const connection = await mongoDBProvider.open();
      const closeConnection = await mongoDBProvider.close(connection);

      // eslint-disable-next-line no-undef
      should.not.exist(closeConnection);
    });
  });

  describe("getDB", () => {
    it("should return Db Object", async () => {
      const connection = await mongoDBProvider.open();
      const db = mongoDBProvider.getDB(connection);

      // eslint-disable-next-line no-undef
      should.exist(db);

      db.should.be.an("object");

      mongoDBProvider.close(connection);
    });
  });
});
