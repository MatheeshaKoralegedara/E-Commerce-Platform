const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { list } = require('../controllers/auditLogController');

const router = express.Router();
router.get('/', requireAuth, requireAdmin, list);

module.exports = router;