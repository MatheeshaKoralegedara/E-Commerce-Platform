
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validate, create, list, remove } = require('../controllers/discountController');

const router = express.Router();

router.post('/validate', requireAuth, validate);

router.post('/', requireAuth, requireAdmin, create);
router.get('/', requireAuth, requireAdmin, list);
router.delete('/:id', requireAuth, requireAdmin, remove);

module.exports = router;