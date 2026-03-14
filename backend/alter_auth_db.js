const pool = require('./src/config/db');

async function alterDB() {
  try {
    console.log('Altering users...');
    // Add login_id, allow null initially to avoid breaking existing without defaults
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS login_id VARCHAR(12);');
    
    // Set default login_id for existing users (using a part of their email for simplicity or simple generation)
    const existingUsers = await pool.query('SELECT id, email FROM users WHERE login_id IS NULL');
    for (let u of existingUsers.rows) {
      let base = u.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
      let tempLoginId = base + Math.floor(100 + Math.random() * 900); // ensure some uniqueness
      await pool.query('UPDATE users SET login_id = $1 WHERE id = $2', [tempLoginId, u.id]);
    }
    
    // Now add the unique constraint (in case there are no duplicates newly created)
    await pool.query('ALTER TABLE users ADD CONSTRAINT unique_login_id UNIQUE (login_id);');

    console.log('Database modification for auth complete.');
    process.exit(0);
  } catch (err) {
    if (err.code === '42P16') {
      console.log('Unique constraint already exists, continuing...');
      process.exit(0);
    }
    console.error('Error altering DB:', err);
    process.exit(1);
  }
}

alterDB();
