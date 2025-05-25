const Categories = require('./category.model');

// Create Category
const createCategories = async (req, res) => {
  try {
    const { name } = req.body;
    const newCategory = await Categories.create({ name });
    res.status(201).json({ message: 'Category created successfully', category: newCategory });
  } catch (error) {
    res.status(500).json({ message: 'Error creating category', error: error.message });
  }
};

// Get All Categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Categories.findAll();
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Get Category by ID
const getCategoriesById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Categories.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching category', error: error.message });
  }
};

// Update Category
const updateCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    await category.save();

    res.status(200).json({ message: 'Category updated successfully', category });
  } catch (error) {
    res.status(500).json({ message: 'Error updating category', error: error.message });
  }
};

// Delete Category
const deleteCategories = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Categories.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    await category.destroy();

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting category', error: error.message });
  }
};

module.exports = {
  createCategories,
  getAllCategories,
  getCategoriesById,
  updateCategories,
  deleteCategories,
};
