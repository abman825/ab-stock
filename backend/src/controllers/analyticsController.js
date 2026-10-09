const Order = require('../models/Order');

// 1. Analytics Function (ለ Dashboard Cards)
exports.getAnalytics = async (req, res) => {
  try {
    const { businessType } = req.query;

    let filter = {};
    if (req.user && req.user.id) {
      filter.user = req.user.id;
    }

    if (businessType && businessType !== 'undefined' && businessType !== 'null') {
      if (businessType.includes('building')) {
        filter.businessType = { $in: ['building', 'business_building', 'building_materials', 'buildingMaterials'] };
      } else {
        filter.businessType = { $in: ['pharmacy', null, undefined, ''] };
      }
    }

    // ከ filter ጋር ብቻ የሚጣጣሙትን ትዕዛዞች ያመጣል
    let orders = await Order.find(filter);

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
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    const todayStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt);
      const orderDateStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
      
      const grandTotal = Number(order.grandTotal || order.subtotal || order.total || order.totalAmount || 0);

      let orderProfit = 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const sellPrice = Number(item.price || item.unitPrice || item.sellPrice || 0);
          const costPrice = Number(item.costPrice || item.buyPrice || item.boughtPrice || 0);
          const qty = Number(item.cartQty || item.quantity || 1);
          orderProfit += (sellPrice - costPrice) * qty;
        });

        if (order.discountAmount) {
          orderProfit -= Number(order.discountAmount);
        }
      } else if (order.profit !== undefined) {
        orderProfit = Number(order.profit);
      } else if (order.netProfit !== undefined) {
        orderProfit = Number(order.netProfit);
      }

      // 1. ጠቅላላ
      stats.totalSales += grandTotal;
      stats.totalProfit += orderProfit;

      // 2. የዛሬ
      if (orderDateStr === todayStr) {
        stats.dailySales += grandTotal;
        stats.dailyProfit += orderProfit;
      }

      // 3. የሳምንት
      if (orderDate >= sevenDaysAgo) {
        stats.weeklySales += grandTotal;
        stats.weeklyProfit += orderProfit;
      }

      // 4. የወር
      if (orderDate.getFullYear() === currentYear && orderDate.getMonth() === currentMonth) {
        stats.monthlySales += grandTotal;
        stats.monthlyProfit += orderProfit;
      }

      // 5. ዓመት
      if (orderDate.getFullYear() === currentYear) {
        stats.yearlySales += grandTotal;
        stats.yearlyProfit += orderProfit;
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
        filter.businessType = { $in: ['building', 'business_building', 'building_materials', 'buildingMaterials'] };
      } else {
        filter.businessType = { $in: ['pharmacy', null, undefined, ''] };
      }
    }

    let orders = await Order.find(filter).sort({ createdAt: -1 });

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

      const grandTotal = Number(order.grandTotal || order.subtotal || order.total || order.totalAmount || 0);
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