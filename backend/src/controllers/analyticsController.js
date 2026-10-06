const Order = require('../models/Order');

// 1. Analytics Function (ለ Dashboard Cards)
exports.getAnalytics = async (req, res) => {
  try {
    const { businessType } = req.query;

    let filter = {};
    if (req.user && req.user.id) {
      filter.user = req.user.id;
    }

    // businessType ከተላከ ብቻ ፊልተር ያደርጋል፤ ባዶ ከሆነ ግን ሁሉንም ያመጣል
    if (businessType && businessType !== 'undefined' && businessType !== 'null') {
      if (businessType.includes('building')) {
        filter.businessType = { $in: ['building', 'building_materials', 'buildingMaterials'] };
      } else {
        filter.businessType = { $in: ['pharmacy', null, undefined, ''] };
      }
    }

    let orders = await Order.find(filter);

    // ፊልተር ተደርጎ ዳታ ካልተገኘ ያለ businessType ፊልተር ሁሉንም የዚህን user ኦርደሮች ያመጣል
    if (orders.length === 0 && filter.user) {
      orders = await Order.find({ user: req.user.id });
    }

    let stats = {
      dailySales: 0,
      dailyProfit: 0,
      weeklySales: 0,
      weeklyProfit: 0,
      monthlySales: 0,
      monthlyProfit: 0,
      yearlySales: 0,
      yearlyProfit: 0,
      totalSales: 0,
      totalProfit: 0
    };

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    orders.forEach((order) => {
      const orderDateStr = new Date(order.createdAt).toISOString().split('T')[0];
      const grandTotal = order.grandTotal || order.subtotal || order.total || order.totalAmount || 0;

      let orderProfit = 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const sellPrice = Number(item.price || item.unitPrice || item.sellPrice || 0);
          const costPrice = Number(item.costPrice || item.buyPrice || 0);
          const qty = Number(item.quantity || 1);
          orderProfit += (sellPrice - costPrice) * qty;
        });

        if (order.discountAmount) {
          orderProfit -= Number(order.discountAmount);
        }
      } else if (order.netProfit) {
        orderProfit = Number(order.netProfit);
      }

      stats.totalSales += grandTotal;
      stats.totalProfit += orderProfit;

      if (orderDateStr === todayStr) {
        stats.dailySales += grandTotal;
        stats.dailyProfit += orderProfit;
      }
    });

    res.json(stats);
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Server error in analytics: " + err.message });
  }
};

// 2. Daily History Function (ለ Table)
exports.getDailyHistory = async (req, res) => {
  try {
    const { businessType } = req.query;

    let filter = {};
    if (req.user && req.user.id) {
      filter.user = req.user.id;
    }

    if (businessType && businessType !== 'undefined' && businessType !== 'null') {
      if (businessType.includes('building')) {
        filter.businessType = { $in: ['building', 'building_materials', 'buildingMaterials'] };
      } else {
        filter.businessType = { $in: ['pharmacy', null, undefined, ''] };
      }
    }

    let orders = await Order.find(filter).sort({ createdAt: -1 });

    // ዳታ ካልተገኘ ያለ ፊልተር ያመጣል
    if (orders.length === 0 && filter.user) {
      orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    }

    const historyMap = {};

    orders.forEach((order) => {
      const dateKey = new Date(order.createdAt).toISOString().split('T')[0];

      if (!historyMap[dateKey]) {
        historyMap[dateKey] = {
          date: order.createdAt,
          totalSales: 0,
          totalProfit: 0
        };
      }

      const grandTotal = order.grandTotal || order.subtotal || order.total || order.totalAmount || 0;
      historyMap[dateKey].totalSales += grandTotal;

      let orderProfit = 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const sellPrice = Number(item.price || item.unitPrice || item.sellPrice || 0);
          const costPrice = Number(item.costPrice || item.buyPrice || 0);
          const qty = Number(item.quantity || 1);
          orderProfit += (sellPrice - costPrice) * qty;
        });

        if (order.discountAmount) {
          orderProfit -= Number(order.discountAmount);
        }
      } else if (order.netProfit) {
        orderProfit = Number(order.netProfit);
      }

      historyMap[dateKey].totalProfit += orderProfit;
    });

    const dailyHistory = Object.values(historyMap);

    res.json(dailyHistory);
  } catch (err) {
    console.error("Daily history error:", err);
    res.status(500).json({ error: "Server error in daily history: " + err.message });
  }
};