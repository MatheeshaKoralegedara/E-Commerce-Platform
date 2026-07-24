
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { list, create, update, remove } = require('../controllers/categoryController');

const router = express.Router();

router.get('/', list); // public — anyone can browse categories

router.post('/', requireAuth, requireAdmin, create);
router.patch('/:id', requireAuth, requireAdmin, update);
router.delete('/:id', requireAuth, requireAdmin, remove);

module.exports = router;