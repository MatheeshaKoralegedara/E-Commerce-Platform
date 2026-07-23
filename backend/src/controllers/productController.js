
const {
  createProduct,
  addVariant,
  listActiveProducts,
  getProductBySlug,
  listAllProducts,
  updateProductStatus,
  searchProducts,
} = require('../models/productModel');

// Admin: create a new product (starts as 'draft')
async function create(req, res) {
  try {
    const { name, slug, description, categoryId } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }
    const product = await createProduct({ name, slug, description, categoryId });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') { // Postgres unique_violation
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create product' });
  }
}

// Admin: add a variant to a product
async function addProductVariant(req, res) {
  try {
    const { productId } = req.params;
    const { sku, priceCents, attributes, stockQty } = req.body;

    if (!sku || priceCents == null || stockQty == null) {
      return res.status(400).json({ error: 'sku, priceCents, and stockQty are required' });
    }

    const variant = await addVariant({
      productId,
      sku,
      priceCents,
      attributes,
      stockQty,
    });
    res.status(201).json(variant);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'SKU already exists' });
    }
    res.status(500).json({ error: 'Failed to add variant' });
  }
}

// Admin: publish/unpublish a product
async function setStatus(req, res) {
  try {
    const { productId } = req.params;
    const { status } = req.body;
    if (!['draft', 'active', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const product = await updateProductStatus(productId, status);
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
}

// Public: list active products (paginated)


async function list(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;
    const categorySlug = req.query.category || null;
    const products = await listActiveProducts({ limit, offset, categorySlug });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list products' });
  }
}

// Public: get one product by slug
async function getBySlug(req, res) {
  try {
    const product = await getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get product' });
  }
}

// Admin: list everything including drafts
async function adminList(req, res) {
  try {
    const products = await listAllProducts();
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list products' });
  }
}


async function assignCategory(req, res) {
  try {
    const { productId } = req.params;
    const { categoryId } = req.body;

    const result = await require('../config/db').query(
      `UPDATE products SET category_id = $1 WHERE id = $2 RETURNING *`,
      [categoryId, productId]
    );

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to assign category' });
  }
}

async function search(req, res) {
  try {
    const q = (req.query.q || '').trim();
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const products = await searchProducts({ q, limit, offset });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
}

module.exports = { create, addProductVariant, setStatus, list, getBySlug, adminList, assignCategory, search };