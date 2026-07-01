const { v4: uuidv4 } = require('uuid');
const { getPool } = require('./db/pool');

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    premiumStatus: row.premium_status,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at
  };
}

async function upsertUser(email) {
  const key = email.toLowerCase();
  const pool = getPool();
  const existing = await pool.query('SELECT * FROM users WHERE email = $1', [key]);
  if (existing.rows[0]) return mapUser(existing.rows[0]);

  const id = uuidv4();
  const inserted = await pool.query(
    `INSERT INTO users (id, email, premium_status) VALUES ($1, $2, 'free') RETURNING *`,
    [id, key]
  );
  return mapUser(inserted.rows[0]);
}

async function getUserById(id) {
  const result = await getPool().query('SELECT * FROM users WHERE id = $1', [id]);
  return mapUser(result.rows[0]);
}

async function setUserPremiumStatus(userId, premiumStatus) {
  const allowed = ['free', 'safe', 'premium', 'expired', 'admin'];
  const status = allowed.includes(premiumStatus) ? premiumStatus : 'free';
  const result = await getPool().query(
    `UPDATE users
     SET premium_status = $2,
         pending_payment_id = NULL,
         pending_payment_plan = NULL
     WHERE id = $1
     RETURNING *`,
    [userId, status]
  );
  return mapUser(result.rows[0]);
}

async function saveUserPendingPayment(userId, paymentId, plan) {
  const normalizedPlan = plan === 'safe' || plan === 'premium' ? plan : null;
  if (!normalizedPlan || !paymentId) return null;
  await getPool().query(
    `UPDATE users SET pending_payment_id = $2, pending_payment_plan = $3 WHERE id = $1`,
    [userId, String(paymentId), normalizedPlan]
  );
  return { paymentId: String(paymentId), plan: normalizedPlan };
}

async function getUserPendingPayment(userId) {
  const result = await getPool().query(
    `SELECT pending_payment_id, pending_payment_plan FROM users WHERE id = $1`,
    [userId]
  );
  const row = result.rows[0];
  if (!row?.pending_payment_id) return null;
  const plan = row.pending_payment_plan;
  if (plan !== 'safe' && plan !== 'premium') return null;
  return { paymentId: String(row.pending_payment_id), plan };
}

async function clearUserPendingPayment(userId) {
  await getPool().query(
    `UPDATE users SET pending_payment_id = NULL, pending_payment_plan = NULL WHERE id = $1`,
    [userId]
  );
}

async function saveMagicToken(email, token) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await getPool().query(
    `INSERT INTO magic_tokens (token, email, expires_at) VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE SET email = EXCLUDED.email, expires_at = EXCLUDED.expires_at`,
    [token, email.toLowerCase(), expiresAt]
  );
}

async function consumeMagicToken(token) {
  const result = await getPool().query(
    `DELETE FROM magic_tokens WHERE token = $1 AND expires_at > NOW() RETURNING email`,
    [token]
  );
  return result.rows[0]?.email ?? null;
}

async function saveOtpCode(email, code) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await getPool().query(
    `INSERT INTO otp_codes (email, code, expires_at) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
    [email.toLowerCase(), code, expiresAt]
  );
}

async function consumeOtpCode(email, code) {
  const result = await getPool().query(
    `DELETE FROM otp_codes WHERE email = $1 AND code = $2 AND expires_at > NOW() RETURNING email`,
    [email.toLowerCase(), String(code).trim()]
  );
  return result.rows[0]?.email ?? null;
}

function normalizeProgressPayload(progress) {
  const payload = { ...progress };
  if (!payload.id) payload.id = uuidv4();
  if (!payload.updatedAt) payload.updatedAt = new Date().toISOString();
  return payload;
}

async function listDeals(userId) {
  const result = await getPool().query(
    `SELECT id, scenario_id, progress, updated_at
     FROM deals WHERE user_id = $1
     ORDER BY updated_at DESC`,
    [userId]
  );
  return result.rows.map((row) => {
    const progress = row.progress ?? {};
    return {
      ...progress,
      id: progress.id ?? row.id,
      scenarioId: progress.scenarioId ?? row.scenario_id,
      updatedAt: progress.updatedAt ?? row.updated_at?.toISOString?.() ?? row.updated_at
    };
  });
}

async function saveDealProgress(userId, progress) {
  const pool = getPool();
  if (!progress) {
    await pool.query('DELETE FROM deals WHERE user_id = $1', [userId]);
    return null;
  }

  const payload = normalizeProgressPayload(progress);
  const dealId = payload.id;

  const result = await pool.query(
    `INSERT INTO deals (id, user_id, scenario_id, progress, updated_at)
     VALUES ($1, $2, $3, $4::jsonb, NOW())
     ON CONFLICT (id) DO UPDATE SET
       scenario_id = EXCLUDED.scenario_id,
       progress = EXCLUDED.progress,
       updated_at = NOW()
     RETURNING progress`,
    [dealId, userId, payload.scenarioId, JSON.stringify(payload)]
  );
  return result.rows[0]?.progress ?? null;
}

async function getDealProgress(userId, dealId) {
  if (dealId) {
    const result = await getPool().query(
      `SELECT progress FROM deals WHERE user_id = $1 AND id = $2`,
      [userId, dealId]
    );
    return result.rows[0]?.progress ?? null;
  }
  const result = await getPool().query(
    `SELECT progress FROM deals WHERE user_id = $1
     ORDER BY updated_at DESC LIMIT 1`,
    [userId]
  );
  return result.rows[0]?.progress ?? null;
}

async function deleteDealProgress(userId, dealId) {
  if (dealId) {
    await getPool().query('DELETE FROM deals WHERE user_id = $1 AND id = $2', [userId, dealId]);
    return;
  }
  await getPool().query('DELETE FROM deals WHERE user_id = $1', [userId]);
}

async function searchUsers(query, limit = 50) {
  const q = String(query ?? '').trim();
  const cap = Math.min(Math.max(Number(limit) || 50, 1), 100);
  if (!q) {
    const result = await getPool().query(
      `SELECT * FROM users ORDER BY created_at DESC LIMIT $1`,
      [cap]
    );
    return result.rows.map(mapUser);
  }
  const pattern = `%${q.replace(/[%_]/g, '')}%`;
  const result = await getPool().query(
    `SELECT * FROM users
     WHERE email ILIKE $1 OR id::text = $2
     ORDER BY created_at DESC
     LIMIT $3`,
    [pattern, q, cap]
  );
  return result.rows.map(mapUser);
}

async function deleteUserById(userId) {
  await getPool().query('DELETE FROM users WHERE id = $1', [userId]);
}

async function addConsultation(payload) {
  const id = uuidv4();
  const result = await getPool().query(
    `INSERT INTO consultations (id, user_id, deal_id, scenario_id, step_id, need_type, message, phone, email)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING id, created_at`,
    [
      id,
      payload.userId ?? null,
      payload.dealId ?? null,
      payload.scenarioId ?? null,
      payload.stepId ?? null,
      payload.needType,
      payload.message,
      payload.phone ?? null,
      payload.userEmail ?? null
    ]
  );
  return {
    id: result.rows[0].id,
    ...payload,
    createdAt: result.rows[0].created_at.toISOString()
  };
}

module.exports = {
  upsertUser,
  getUserById,
  setUserPremiumStatus,
  saveUserPendingPayment,
  getUserPendingPayment,
  clearUserPendingPayment,
  searchUsers,
  deleteUserById,
  saveMagicToken,
  consumeMagicToken,
  saveOtpCode,
  consumeOtpCode,
  listDeals,
  saveDealProgress,
  getDealProgress,
  deleteDealProgress,
  addConsultation
};
