import { get_default_db_provider } from "./db/Index";
import { Db, MongoClient, ObjectId } from "mongodb";

export default class PersistenceProvider {
  constructor() {
    this.dbProvider = get_default_db_provider();
  }

  /**
   * @returns {Promise<MongoClient>} DB Provider client object.
   * @private
   */
  __openConnection() {
    return this.dbProvider.open();
  }

  /**
   * @param {MongoClient} dbConnection DB provider connection object.
   *
   * @returns {Db} DB Provider db object.
   * @private
   */
  __getDB(dbConnection) {
    return this.dbProvider.getDB(dbConnection);
  }

  /**
   * @param {MongoClient} dbConnection DB provider connection object.
   */
  closeConnection(dbConnection) {
    this.dbProvider.close(dbConnection);
  }

  /**
   * @param {string} entityName Collection name of entities.
   * @param {object} [filter] Filter used to retrieve elements.
   * @param {number} [limit] Limit used to retrieve elements.
   * @param {number} [offset] Offset used to retrieve elements.
   *
   * @returns {Promise<object[]>} Entities by filter applied.
   */
  async getEntities(entityName, filter = {}, limit, offset = 0) {
    const connection = await this.__openConnection();
    const db = this.__getDB(connection);
    const collection = db.collection(entityName);

    let data = await collection
      .find(filter)
      .skip(offset === 0 ? offset : offset - 1);

    if (limit) {
      data = await data.limit(limit);
    }

    data = await data.toArray();

    this.closeConnection(connection);

    return data;
  }

  /**
   * @param {string} entityName Collection name of entities.
   * @param {string} entityID Entity ID used to retrieve element.
   *
   * @returns {Promise<object>} Entity by ID.
   */
  async getEntityByID(entityName, entityID) {
    const filter = {
      _id: new ObjectId(entityID),
    };

    const data = await this.getEntities(entityName, filter);

    return data[0];
  }

  /**
   * @param {string} entityName Collection name of entities.
   * @param {object} filter Filter used to retrieve elements.
   *
   * @returns {Promise<object>} Entity by filter.
   */
  async getEntityByFilter(entityName, filter) {
    const data = await this.getEntities(entityName, filter);

    return data[0];
  }

  /**
   * @param {string} entityName Collection name of entities.
   * @param {object} entity Entity object to save.
   *
   * @returns {Promise<object>} DB provider result object.
   */
  async saveEntity(entityName, entity) {
    const connection = await this.__openConnection();
    const db = this.__getDB(connection);
    const collection = db.collection(entityName);

    const result = await collection.insertOne(entity);

    this.closeConnection(connection);

    return result;
  }

  async updateEntityByID(entityName, entityID, data) {
    const connection = await this.__openConnection();
    const db = this.__getDB(connection);
    const collection = db.collection(entityName);

    const filter = {
      _id: new ObjectId(entityID),
    };

    const result = await collection.updateOne(filter, { $set: data });

    this.closeConnection(connection);

    return result;
  }

  /**
   * @param {string} entityName Collection name of entities.
   * @param {object} filter Filter used to update elements.
   * @param {object} data Data object to update.
   *
   * @returns {Promise<object>} DB provider result object.
   */
  async updateEntity(entityName, filter, data) {
    const connection = await this.__openConnection();
    const db = this.__getDB(connection);
    const collection = db.collection(entityName);

    const result = await collection.updateOne(filter, { $set: data });

    this.closeConnection(connection);

    return result;
  }

  /**
   * @param {string} entityName Collection name of entities.
   * @param {object} filter Filter used to delete elements.
   *
   * @returns {Promise<object>} DB provider result object.
   */
  async deleteEntities(entityName, filter) {
    const connection = await this.__openConnection();
    const db = this.__getDB(connection);
    const collection = db.collection(entityName);

    const result = await collection.deleteMany(filter);

    this.closeConnection(connection);

    return result;
  }

  /**
   * @param {string} entityName Collection name of entities.
   * @param {string} entityID Entity ID used to delete element.
   *
   * @returns {Promise<object>} DB provider result object.
   */
  async deleteEntityByID(entityName, entityID) {
    const filter = {
      _id: entityID,
    };

    return await this.deleteEntities(entityName, filter);
  }
}
