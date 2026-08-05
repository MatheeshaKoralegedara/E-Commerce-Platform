
const express = require('express');
const multer = require('multer');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { uploadImage } = require('../controllers/uploadController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

const router = express.Router();
router.post('/image', requireAuth, requireAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Image is too large. Please upload a file under 10MB.' });
      }
      return res.status(400).json({ error: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(500).json({ error: 'Upload failed' });
    }
    next();
  });
}, uploadImage);

module.exports = router;