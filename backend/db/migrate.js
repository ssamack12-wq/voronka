const fs = require('fs');
const path = require('path');
const { getPool } = require('./pool');

async function runMigrations() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query(sql);
    await client.query(`ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_user_id_key`);
    await client.query(
      `CREATE INDEX IF NOT EXISTS idx_deals_user_updated ON deals(user_id, updated_at DESC)`
    );
    await client.query(`ALTER TABLE consultations ALTER COLUMN user_id DROP NOT NULL`);
    await client.query(`DELETE FROM magic_tokens WHERE expires_at < NOW()`);
    await client.query(`DELETE FROM otp_codes WHERE expires_at < NOW()`);
    await client.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_payment_id TEXT`
    );
    await client.query(
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_payment_plan TEXT`
    );
    console.info('[postgres] schema ready');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { runMigrations };
