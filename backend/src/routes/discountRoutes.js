
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { discountLimiter } = require('../middleware/rateLimiters');
const { validate, create, list, remove, update } = require('../controllers/discountController');

const router = express.Router();

router.post('/validate', discountLimiter, requireAuth, validate);

router.post('/', requireAuth, requireAdmin, create);
router.get('/', requireAuth, requireAdmin, list);
router.delete('/:id', requireAuth, requireAdmin, remove);
router.patch('/:id', requireAuth, requireAdmin, update)

module.exports = router;