
const express = require('express');
const multer = require('multer');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadImage } = require('../controllers/uploadController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const router = express.Router();
router.post('/image', requireAuth, requireAdmin, upload.single('image'), uploadImage);

module.exports = router;