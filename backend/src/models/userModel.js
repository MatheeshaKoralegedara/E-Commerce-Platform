const { query } = require('../config/db');

async function createUser(email, passwordHash) {
    const result = await query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role, created_at',
        [email, passwordHash]
    );
    return result.rows[0];
}

async function findUserByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
}

function sanitizeUser(user) {
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };
}

async function setResetToken(email, tokenHash, expiresAt) {
  await query(
    `UPDATE users SET reset_token_hash = $1, reset_token_expires = $2 WHERE email = $3`,
    [tokenHash, expiresAt, email]
  );
}

async function findUserByResetTokenHash(tokenHash) {
  const result = await query(
    `SELECT * FROM users WHERE reset_token_hash = $1 AND reset_token_expires > now()`,
    [tokenHash]
  );
  return result.rows[0];
}

async function updatePasswordAndClearReset(userId, passwordHash) {
  await query(
    `UPDATE users SET password_hash = $1, reset_token_hash = NULL, reset_token_expires = NULL WHERE id = $2`,
    [passwordHash, userId]
  );
}

module.exports = { createUser, findUserByEmail, sanitizeUser, setResetToken, findUserByResetTokenHash, updatePasswordAndClearReset };