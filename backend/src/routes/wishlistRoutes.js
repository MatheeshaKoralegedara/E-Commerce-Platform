const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { list, listIds, add, remove } = require('../controllers/wishlistController');

const router = express.Router();

router.get('/', requireAuth, list);
router.get('/ids', requireAuth, listIds);
router.post('/', requireAuth, add);
router.delete('/:productId', requireAuth, remove);

module.exports = router;
