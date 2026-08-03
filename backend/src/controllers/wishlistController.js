// backend/src/controllers/wishlistController.js
const { addToWishlist, removeFromWishlist, getWishlist, getWishlistedProductIds } = require('../models/wishlistModel');

async function list(req, res) {
  try {
    const items = await getWishlist(req.user.userId);
    res.json(items);
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch wishlist');
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
}

async function listIds(req, res) {
  try {
    const ids = await getWishlistedProductIds(req.user.userId);
    res.json(ids);
  } catch (err) {
    req.log.error({ err }, 'Failed to fetch wishlist ids');
    res.status(500).json({ error: 'Failed to fetch wishlist ids' });
  }
}

async function add(req, res) {
  try {
    const { productId } = req.body;
    if (!productId) return res.status(400).json({ error: 'productId is required' });
    await addToWishlist(req.user.userId, productId);
    res.status(201).json({ added: true });
  } catch (err) {
    req.log.error({ err }, 'Failed to add to wishlist');
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
}

async function remove(req, res) {
  try {
    const { productId } = req.params;
    const removed = await removeFromWishlist(req.user.userId, productId);
    res.json({ removed });
  } catch (err) {
    req.log.error({ err }, 'Failed to remove from wishlist');
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
}

module.exports = { list, listIds, add, remove };
