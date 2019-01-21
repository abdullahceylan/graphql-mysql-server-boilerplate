import mysql from 'mysql';

class MySQLConnector {
  constructor() {
    // Instantiates the connection pool
    this.internalPool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || '3306',
      database: process.env.MYSQL_DBNAME || '',
      user: process.env.MYSQL_USERNAME || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      connectionLimit: process.env.MYSQL_DB_POOL_SIZE || 10,
      waitForConnections: true,
    });

    // Allows better control of openned connections
    this.registerThreadCounter();
  }

  /**
   * Registers an event lister to capture when new connections are oppened
   * This method uses console.log, but in an production environment you'd probably
   * use a async log write such as winston since console.log is blocking
   *
   */
  registerThreadCounter() {
    this.internalPool.on('connection', connection =>
      console.log(`New connection stablished with server on thread #${connection.threadId}`));
  }

  /**
   * Retrieves the connection pool
   */
  get pool() {
    return this.internalPool;
  }
}

module.exports = new MySQLConnector();
