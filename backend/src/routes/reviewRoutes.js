
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { listForProduct, create, update, remove } = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true }); // needed to access :productId from the parent route

router.get('/', listForProduct);
router.post('/', requireAuth, create);
router.patch('/', requireAuth, update);
router.delete('/', requireAuth, remove);

module.exports = router;