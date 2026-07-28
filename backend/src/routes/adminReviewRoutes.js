const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { adminList, adminRemove } = require('../controllers/reviewController');

const router = express.Router();
router.get('/', requireAuth, requireAdmin, adminList);
router.delete('/:reviewId', requireAuth, requireAdmin, adminRemove);

module.exports = router;