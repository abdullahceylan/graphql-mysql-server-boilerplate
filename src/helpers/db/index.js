import mysqlWrapper from './mysqlWrapper';

class Database {
  constructor(tableName) {
    this.TABLE_NAME = tableName;
    this.PRIMARY_KEY = 'id';
  }

  /**
   * Prepare the sql query with utilizing the proper escaping for ids and values
   * @param {String} query - The column name
   * @param {Array} values - The values to escape
   */
  prepare({ query, values }) {
    return mysqlWrapper.format(query, values);
  }

  /**
   * Retrieves a single entry matching the passed ID
   * @param {Number} id - The entry ID
   */
  async find(id) {
    return (await mysqlWrapper.createQuery({
      query: 'SELECT * FROM ?? WHERE ?? = ? LIMIT 1;',
      params: [this.TABLE_NAME, this.PRIMARY_KEY, id],
    })).shift();
  }

  /**
   * Retrieves entries that matching the passed the column and value
   * @param {String} column - The column name
   * @param {String} value - The value
   * @param {Number} column - Limit of the records
   */
  async findBy({ column, value, limit = 10 }) {
    return (await mysqlWrapper.createQuery({
      query: 'SELECT * FROM ?? WHERE ?? = ? LIMIT ?;',
      params: [this.TABLE_NAME, column, value, limit],
    })).shift();
  }

  /**
   * Retrieves entries that matching the passed the column and value
   * @param {String} column - The column name
   * @param {String} value - The value
   * @param {Number} column - Limit of the records
   */
  findAllBy({ column, value, limit = 10 }) {
    return mysqlWrapper.createQuery({
      query: this.prepare({
        query: 'SELECT * FROM ?? WHERE ?? LIKE ? LIMIT ?;',
        values: [this.TABLE_NAME, column, `%${value}%`, limit],
      }),
      // params: [this.TABLE_NAME, column, `%${value}%`, limit],
    });
  }

  /**
   * Retrieves all entries on the extending class' table
   */
  findAll({ limit = 10 }) {
    return mysqlWrapper.createQuery({
      query: 'SELECT * FROM ?? LIMIT ?;',
      params: [this.TABLE_NAME, limit],
    });
  }

  /**
   * Find entries by their fields
   * @param {Object} fields - The fields to be matched
   * @param {Object} limit - Limits the amount of returned entries
   * @param {Object} order - Orders the returned entries using a provided field
   */
  findByFields({ fields, limit = 10, order }) {
    let baseQuery = 'SELECT * FROM ?? WHERE ';

    const params = [this.TABLE_NAME];

    Object.keys(fields).forEach((key, index) => {
      baseQuery += `${key} = ?`;
      params.push(fields[key]);
      if (index + 1 !== Object.keys(fields).length) baseQuery += ' AND ';
    });

    if (order != null && order.by != null && order.direction != null) {
      baseQuery += ' ORDER BY ??';
      baseQuery += order.direction === 'desc' ? ' DESC' : ' ASC';
      params.push(order.by);
    }

    if (limit != null && !isNaN(limit)) {
      baseQuery += ' LIMIT ?';
      params.push(limit);
    }

    return mysqlWrapper.createQuery({
      query: baseQuery,
      params,
    });
  }

  /**
   * Updates an entry
   * @param {MySQL.Connection} connection - The connection which will do the update. It should be immediatelly released unless in a transaction
   * @param {Object} data - The data fields which will be updated
   * @param {Number} id - The ID of the entry to be updated
   */
  update(connection, { data, id }) {
    return mysqlWrapper.createTransactionalQuery({
      query: `UPDATE ??
                    SET ?
                    WHERE ?? = ?;`,
      params: [this.TABLE_NAME, data, this.PRIMARY_KEY, id],
      connection,
    });
  }

  /**
   * Inserts a new entry
   * @param {MySQL.Connection} connection - The connection which will do the insert. It should be immediatelly released unless in a transaction
   * @param {Object} data - The fields which will populate the new entry
   */
  insert(connection, { data }) {
    return mysqlWrapper.createTransactionalQuery({
      query: `INSERT INTO ${this.TABLE_NAME}
                    SET ?;`,
      params: [data],
      connection,
    });
  }

  /**
   * Deletes an entry
   * @param {MySQL.Connection} connection - The connection which will do the deletion. It should be immediatelly released unless in a transaction
   * @param {Number} id - The ID of the entry to be deleted
   */
  delete(connection, { id }) {
    return mysqlWrapper.createTransactionalQuery({
      query: `DELETE FROM  ??
                    WHERE ?? = ?;`,
      params: [this.TABLE_NAME, this.PRIMARY_KEY, id],
      connection,
    });
  }
}

export { Database, mysqlWrapper };
