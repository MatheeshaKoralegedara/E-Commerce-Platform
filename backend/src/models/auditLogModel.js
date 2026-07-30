
const { query } = require('../config/db');

async function logAction({ adminUserId, action, entityType, entityId, details = {} }) {
  await query(
    `INSERT INTO audit_log (admin_user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [adminUserId, action, entityType, entityId, JSON.stringify(details)]
  );
}

async function getAuditLog({ limit = 50, offset = 0 }) {
  const result = await query(
    `SELECT al.*, u.email AS admin_email
     FROM audit_log al
     JOIN users u ON u.id = al.admin_user_id
     ORDER BY al.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

function logActionSafe(params) {
  logAction(params).catch((err) => console.error('Audit log write failed:', err));
}
module.exports = { logAction, getAuditLog, logActionSafe };