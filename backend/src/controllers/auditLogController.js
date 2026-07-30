
const { getAuditLog } = require('../models/auditLogModel');

async function list(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const offset = parseInt(req.query.offset) || 0;
    const logs = await getAuditLog({ limit, offset });
    res.json(logs);
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch audit log');
    res.status(500).json({ error: 'Failed to fetch audit log' });
  }
}

module.exports = { list };