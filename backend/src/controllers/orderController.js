const Order = require('../models/Order');
const Product = require('../models/Product');

const getLocalTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

exports.getOrders = async (req, res) => {
  try {
    const { businessType } = req.query;
    let filter = { user: req.user.id };

    if (businessType) {
      filter.businessType = (businessType === 'building' || businessType.includes('building'))
        ? { $in: ['building', 'building_materials', 'buildingMaterials'] }
        : 'pharmacy';
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { items, subtotal, discountAmount, grandTotal, paymentMethod, soldAtDate, businessType } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'ቢያንስ አንድ እቃ ማሰገባት ያስፈልጋል' });
    }

    let totalCostPrice = 0;
    const processedItems = await Promise.all(
      items.map(async (item) => {
        const productId = item.productId || item._id || item.id;
        let exactCost = item.costPrice || item.boughtPrice;

        if ((exactCost === undefined || exactCost === null) && productId) {
          const product = await Product.findOne({ _id: productId, user: req.user.id });
          if (product) exactCost = product.boughtPrice || product.costPrice || 0;
        }

        const unitPrice = Number(Number(item.price || 0).toFixed(2));
        const finalCost = Number(Number(exactCost || 0).toFixed(2));
        const quantity = Number(item.cartQty || item.quantity || 1);

        totalCostPrice += finalCost * quantity;

        return {
          productId,
          productName: item.productName || item.name || '',
          name: item.productName || item.name || '',
          price: unitPrice,
          costPrice: finalCost,
          boughtPrice: finalCost,
          cartQty: quantity
        };
      })
    );

    const safeSubtotal = Number(Number(subtotal || 0).toFixed(2));
    const safeDiscount = Number(Number(discountAmount || 0).toFixed(2));
    const safeGrandTotal = Number(Number(grandTotal || (safeSubtotal - safeDiscount)).toFixed(2));

    const order = new Order({
      user: req.user.id,
      items: processedItems,
      subtotal: safeSubtotal,
      discountAmount: safeDiscount,
      grandTotal: safeGrandTotal,
      totalCost: totalCostPrice,
      profit: Number((safeGrandTotal - totalCostPrice).toFixed(2)),
      paymentMethod: paymentMethod || 'Cash',
      soldAtDate: soldAtDate || getLocalTodayDate(),
      businessType: (businessType === 'building' ? 'building_materials' : (businessType || req.user?.businessType || 'pharmacy'))
    });

    const savedOrder = await order.save();

    const bulkStockOperations = items.map((item) => {
      const productId = item.productId || item._id || item.id;
      const qtyToDeduct = Number(item.cartQty || item.quantity || 1);

      return {
        updateOne: {
          filter: { _id: productId, user: req.user.id },
          update: { $inc: { quantity: -qtyToDeduct, stock: -qtyToDeduct, inShop: -qtyToDeduct } }
        }
      };
    }).filter(op => op.updateOne.filter._id);

    if (bulkStockOperations.length > 0) await Product.bulkWrite(bulkStockOperations);

    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message || 'ሽያጩን ማስመዝገብ አልተቻለም' });
  }
};

exports.getTodaySalesSummary = async (req, res) => {
  try {
    const { businessType } = req.query;
    const todayStr = getLocalTodayDate();

    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(); endOfToday.setHours(23, 59, 59, 999);

    const filter = {
      $or: [{ soldAtDate: todayStr }, { createdAt: { $gte: startOfToday,$lte: endOfToday } }]
    };
    if (businessType) filter.businessType = businessType;

    const orders = await Order.find(filter);

    let cash = 0, bank = 0, telebirr = 0;
    orders.forEach((order) => {
      const amount = Number(order.grandTotal || order.total || 0);
      const method = (order.paymentMethod || 'Cash').toLowerCase();
      if (method === 'cash') cash += amount;
      else if (method === 'bank') bank += amount;
      else if (method === 'telebirr') telebirr += amount;
    });

    res.json({ cash, bank, telebirr, total: cash + bank + telebirr });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};