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

exports.createCategoriesBulk = async (req, res) => {
  try {
    const categories = req.body;
    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({ message: 'Ga go na data yeo e amogetšwego!' });
    }

    const currentBusinessType = req.user?.businessType || 'pharmacy';

    // 1. Hlwekisa dintlha le go aba ID ye mpsha gore go se be le kganetšano
    const formattedCategories = categories.map((cat) => ({
      name: (cat.name || cat.CategoryName || cat.Name || '').trim(),
      categoryId: cat.categoryId || cat.CategoryId || Math.floor(100000 + Math.random() * 900000).toString(),
      productsCount: Number(cat.productsCount || cat.ProductsCount) || 0,
      user: req.user.id,
      businessType: cat.businessType || currentBusinessType
    })).filter(c => c.name !== '');

    if (formattedCategories.length === 0) {
      return res.status(400).json({ message: 'Ga go na maina a dikategori a go amogelesega go CSV!' });
    }

    // 2. Tsenya di-category ka database le go šomiša { ordered: false } gore e se ke ya kgaotša ge go na le duplicate
    const savedCategories = await Category.insertMany(formattedCategories, { ordered: false });
    
    res.status(201).json(savedCategories);
  } catch (err) {
    console.error('Bulk Import Error:', err);
    // Ge e ba phošo e le ya di-duplicate, e swanetše go se lahlele phošo ya 500
    if (err.code === 11000 || err.name === 'MongoBulkWriteError') {
      return res.status(201).json({ message: 'Tše dingwe di tsentšwe, kodutši tša go swana di tlogetšwe!' });
    }
    res.status(500).json({ error: err.message });
  }
};