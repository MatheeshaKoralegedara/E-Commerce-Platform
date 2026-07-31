const { query } = require('../config/db');

async function createUser({ email, passwordHash, fullName, phone, addressLine1, city, postalCode, country }) {
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name, phone, address_line1, city, postal_code, country)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [email, passwordHash, fullName, phone, addressLine1 || null, city || null, postalCode || null, country || null]
  );
  return result.rows[0];
}

function sanitizeUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    full_name: user.full_name,
    phone: user.phone,
    address_line1: user.address_line1,
    city: user.city,
    postal_code: user.postal_code,
    country: user.country,
    created_at: user.created_at,
  };
}

// Add a way to update profile info later too:
async function updateUserProfile(userId, { fullName, phone, addressLine1, city, postalCode, country }) {
  const result = await query(
    `UPDATE users SET full_name = $1, phone = $2, address_line1 = $3, city = $4, postal_code = $5, country = $6
     WHERE id = $7
     RETURNING *`,
    [fullName, phone, addressLine1 || null, city || null, postalCode || null, country || null, userId]
  );
  return result.rows[0];
}

async function findUserByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
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