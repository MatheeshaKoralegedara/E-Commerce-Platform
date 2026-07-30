
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const s3 = require('../config/storage');

async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only JPEG, PNG, and WebP images are allowed' });
    }

    const extension = req.file.mimetype.split('/')[1];
    const key = `products/${crypto.randomUUID()}.${extension}`;

    await s3.send(new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const imageUrl = `${process.env.R2_PUBLIC_URL}/${key}`;
    res.status(201).json({ imageUrl });
  } catch (err) {
    req.log.error({ err }, 'Image upload failed');
    res.status(500).json({ error: 'Image upload failed' });
  }
}

module.exports = { uploadImage };