
const { addProductImage, getProductImages, deleteProductImage, reorderProductImages } = require('../models/productImageModel');
const { getProductImages } = require('../models/productImageModel');

async function list(req, res) {
  try {
    const images = await getProductImages(req.params.productId);
    res.json(images);
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch product images');
    res.status(500).json({ error: 'Failed to fetch product images' });
  }
}

async function add(req, res) {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: 'imageUrl is required' });

    const existing = await getProductImages(req.params.productId);
    const image = await addProductImage(req.params.productId, imageUrl, existing.length);
    res.status(201).json(image);
  } catch (err) {
    req.log.error({ err }, 'Failed to add product image');
    res.status(500).json({ error: 'Failed to add product image' });
  }
}

async function remove(req, res) {
  try {
    const deleted = await deleteProductImage(req.params.imageId);
    if (!deleted) return res.status(404).json({ error: 'Image not found' });
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, 'Failed to delete product image');
    res.status(500).json({ error: 'Failed to delete product image' });
  }
}

async function reorder(req, res) {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ error: 'orderedIds must be an array' });
    await reorderProductImages(req.params.productId, orderedIds);
    res.json({ success: true });
  } catch (err) {
    req.log.error({ err }, 'Failed to reorder product images');
    res.status(500).json({ error: 'Failed to reorder product images' });
  }
}

async function getBySlug(req, res) {
  const product = await getProductBySlug(req.params.slug);
  if (!product) {
    throw new AppError('Product not found', 404);
  }
  const related = await getRelatedProducts(product.id, product.category_id, 4);
  const gallery = await getProductImages(product.id);
  res.json({ ...product, related, gallery });
}

module.exports = { list, add, remove, reorder, getBySlug };