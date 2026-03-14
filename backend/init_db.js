const { Client } = require('pg');
require('dotenv').config();

async function initDb() {
  const defaultClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default db to create new one
  });

  try {
    await defaultClient.connect();
    
    // Check if db exists
    const res = await defaultClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = 'coreinventory'`);
    if (res.rowCount === 0) {
      console.log("Creating database coreinventory...");
      await defaultClient.query(`CREATE DATABASE coreinventory`);
    } else {
      console.log("Database coreinventory already exists.");
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await defaultClient.end();
  }

  // Now connect to the new database to create tables
  const appClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await appClient.connect();
    
    console.log("Creating users table...");
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    console.log("Creating otp_tokens table...");
    await appClient.query(`
      CREATE TABLE IF NOT EXISTS otp_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        otp_code VARCHAR(10) NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        expires_at TIMESTAMP NOT NULL
      )
    `);
    
    console.log("Database initialization complete.");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    await appClient.end();
  }
}

initDb();
