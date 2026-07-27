
const {
  createCategory,
  getAllCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} = require('../models/categoryModel');

async function list(req, res) {
  try {
    const categories = await getAllCategories();
    res.json(categories);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
}

async function create(req, res) {
  try {
    const { name, slug, parentId } = req.body;
    if (!name || !slug) {
      return res.status(400).json({ error: 'name and slug are required' });
    }
    const category = await createCategory(name, slug, parentId || null);
    res.status(201).json(category);
  } catch (err) {
    req.log.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Slug already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
}

async function update(req, res) {
  try {
    const { name, slug, parentId } = req.body;
    const category = await updateCategory(req.params.id, { name, slug, parentId: parentId || null });
    if (!category) return res.status(404).json({ error: 'Category not found' });
    res.json(category);
  } catch (err) {
    req.log.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
}

async function remove(req, res) {
  try {
    await deleteCategory(req.params.id);
    res.status(204).send();
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    req.log.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
}

module.exports = { list, create, update, remove };