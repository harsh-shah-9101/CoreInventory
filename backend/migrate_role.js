const { Client } = require('pg');
require('dotenv').config();

async function migrateRole() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  await client.connect();

  console.log('Adding role column to users...');
  await client.query(`
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'manager'
  `);

  console.log('Role column added. Updating existing users to manager...');
  await client.query(`UPDATE users SET role = 'manager' WHERE role IS NULL`);

  console.log('Migration complete.');
  await client.end();
}

migrateRole().catch(err => { console.error(err); process.exit(1); });
