const Category = require('../models/Category');

// Get Categories
exports.getCategories = async (req, res) => {
  try {
    const { businessType } = req.query;
    let query = { user: req.user.id };

    if (businessType && businessType !== 'undefined' && businessType !== 'null') {
      if (businessType.includes('building')) {
        query.businessType = { $in: ['building', 'building_materials', 'buildingMaterials'] };
      } else {
        query.businessType = { $in: ['pharmacy', null, undefined, ''] };
      }
    }

    const categories = await Category.find(query).sort({ createdAt: -1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Category
exports.createCategory = async (req, res) => {
  try {
    const { name, categoryId, businessType } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'እባክዎን የካቴጎሪ ስም ያስገቡ' });
    }

    const currentBusinessType = businessType || req.user?.businessType || 'pharmacy';

    const newCategory = new Category({
      name: name.trim(),
      categoryId: categoryId || Math.floor(1000 + Math.random() * 9000).toString(),
      user: req.user.id,
      businessType: currentBusinessType
    });

    const saved = await newCategory.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('Error creating category:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const updated = await Category.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ message: 'ካቴጎሪው አልተገኘም' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!category) return res.status(404).json({ message: 'ካቴጎሪው አልተገኘም' });
    res.json({ message: 'ካቴጎሪው በተሳካ ሁኔታ ተሰርዟል' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create Categories Bulk
exports.createCategoriesBulk = async (req, res) => {
  try {
    const categories = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'አስፈላጊው የዳታ ስብስብ አልተላከም!' });
    }

    const formattedCategories = categories.map((cat) => ({
      ...cat,
      user: req.user.id,
      categoryId: cat.categoryId || Math.floor(1000 + Math.random() * 9000).toString()
    }));

    const savedCategories = await Category.insertMany(formattedCategories);
    res.status(201).json(savedCategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};