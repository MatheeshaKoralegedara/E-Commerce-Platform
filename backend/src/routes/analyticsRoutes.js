const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { getOverview } = require('../controllers/analyticsController');

const router = express.Router();
router.get('/overview', requireAuth, requireAdmin, getOverview);

module.exports = router;