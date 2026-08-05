
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { list, add, remove, reorder } = require('../controllers/productImageController');

const router = express.Router({ mergeParams: true });
router.get('/', list); // public — anyone viewing a product should see its gallery
router.post('/', requireAuth, requireAdmin, add);
router.delete('/:imageId', requireAuth, requireAdmin, remove);
router.patch('/reorder', requireAuth, requireAdmin, reorder);

module.exports = router;