// backend/src/routes/productRoutes.js
const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  create,
  addProductVariant,
  setStatus,
  list,
  getBySlug,
  adminList,
  assignCategory,
  search,
  updateImage,
  update,
  removeVariant,

} = require('../controllers/productController');

const router = express.Router();

// Public routes
router.get('/', list);
router.get('/search', search);
router.get('/:slug', getBySlug);


// Admin routes (auth + admin role required)
router.get('/admin/all', requireAuth, requireAdmin, adminList);
router.post('/', requireAuth, requireAdmin, create);
router.post('/:productId/variants', requireAuth, requireAdmin, addProductVariant);
router.patch('/:productId/status', requireAuth, requireAdmin, setStatus);
router.patch('/:productId/category', requireAuth, requireAdmin, assignCategory);
router.patch('/:productId/image', requireAuth, requireAdmin, updateImage);
router.patch('/:productId', requireAuth, requireAdmin, update);
router.delete('/:productId/variants/:variantId', requireAuth, requireAdmin, removeVariant);

module.exports = router;