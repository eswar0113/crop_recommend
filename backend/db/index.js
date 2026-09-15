const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/crop_recommendation';

const pool = new Pool({
  connectionString,
  // 3 second connection timeout
  connectionTimeoutMillis: 3000,
});

let isDbConnected = false;
// Fallback in-memory store if PostgreSQL is temporarily unavailable
const inMemoryHistory = [];
const inMemoryLands = [];
let memoryIdCounter = 1;
let landMemoryIdCounter = 1;

async function initDb() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS lands (
        id SERIAL PRIMARY KEY,
        farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        land_name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        area VARCHAR(100),
        soil_type VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS prediction_history (
        id SERIAL PRIMARY KEY,
        land_id INTEGER REFERENCES lands(id) ON DELETE CASCADE,
        N NUMERIC NOT NULL,
        P NUMERIC NOT NULL,
        K NUMERIC NOT NULL,
        temperature NUMERIC NOT NULL,
        humidity NUMERIC NOT NULL,
        ph NUMERIC NOT NULL,
        rainfall NUMERIC NOT NULL,
        predicted_crop VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE prediction_history ADD COLUMN IF NOT EXISTS land_id INTEGER REFERENCES lands(id) ON DELETE CASCADE;
  `;

  // Parse connection string to find database name
  let targetDbName = 'crop_recommendation';
  try {
    const url = new URL(connectionString);
    if (url.pathname && url.pathname.length > 1) {
      targetDbName = url.pathname.substring(1);
    }
  } catch (e) {}

  try {
    const client = await pool.connect();
    await client.query(createTableQuery);
    client.release();
    isDbConnected = true;
    console.log(`[PostgreSQL] Database connected successfully and tables \`users\`, \`lands\`, \`prediction_history\` verified.`);
  } catch (err) {
    // If error is 'database does not exist', attempt to create database automatically
    if (err.code === '3D000' || (err.message && err.message.toLowerCase().includes('does not exist'))) {
      console.log(`[PostgreSQL] Database "${targetDbName}" does not exist yet. Attempting auto-creation...`);
      try {
        const rootConnectionString = connectionString.replace(`/${targetDbName}`, '/postgres');
        const rootPool = new Pool({ connectionString: rootConnectionString, connectionTimeoutMillis: 3000 });
        const rootClient = await rootPool.connect();
        await rootClient.query(`CREATE DATABASE "${targetDbName}";`);
        rootClient.release();
        await rootPool.end();
        console.log(`[PostgreSQL] Database "${targetDbName}" created successfully!`);

        // Retry target pool connection
        const client = await pool.connect();
        await client.query(createTableQuery);
        client.release();
        isDbConnected = true;
        console.log('[PostgreSQL] Database connected successfully and tables verified.');
        return;
      } catch (createErr) {
        console.warn(`[PostgreSQL Warning] Auto-creation failed: ${createErr.message}`);
      }
    }

    isDbConnected = false;
    console.warn(`[PostgreSQL Warning] Could not connect to PostgreSQL: ${err.message}`);
    console.warn(`[PostgreSQL Tip] Please update backend/.env with your PostgreSQL credentials:`);
    console.warn(`                DATABASE_URL=postgresql://<user>:<password>@localhost:<port>/<dbname>`);
    console.warn('[PostgreSQL Fallback] Backend will run in-memory mode so the application remains fully functional!');
  }
}

async function query(text, params) {
  if (isDbConnected) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.error('[PostgreSQL Error]', err.message);
      throw err;
    }
  } else {
    // Attempt re-connect check on query
    try {
      const result = await pool.query(text, params);
      isDbConnected = true;
      console.log('[PostgreSQL] Connection restored.');
      return result;
    } catch (err) {
      // Return custom handling for fallback
      return null;
    }
  }
}

module.exports = {
  pool,
  query,
  initDb,
  getIsDbConnected: () => isDbConnected,
  inMemoryHistory,
  inMemoryLands,
  memoryIdCounter: { get: () => memoryIdCounter, inc: () => memoryIdCounter++ },
  landMemoryIdCounter: { get: () => landMemoryIdCounter, inc: () => landMemoryIdCounter++ }
};
