const Transfer = require('../models/Transfer');

exports.getTransfers = async (req, res) => {
  try {
    const { businessType } = req.query;
    const filter = { user: req.user.id };

    if (businessType) {
      if (businessType === 'building_materials' || businessType.includes('building')) {
        filter.businessType = { $in: ['building_materials', 'building'] };
      } else {
        filter.$or = [{ businessType: 'pharmacy' }, { businessType: { $exists: false } }, { businessType: '' }];
      }
    }

    const transfers = await Transfer.find(filter).sort({ createdAt: -1 });
    res.json(transfers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createTransfer = async (req, res) => {
  try {
    const newTransfer = new Transfer({ ...req.body, user: req.user.id });
    const saved = await newTransfer.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};