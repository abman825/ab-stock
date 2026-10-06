const Order = require('../models/Order');

const getLocalTodayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

exports.getAnalytics = async (req, res) => {
  try {
    const { businessType } = req.query;
    let filter = {};

    if (req.user && (req.user.id || req.user._id)) {
      const userId = req.user.id || req.user._id;
      filter.$or = [{ user: userId }, { userId: userId }];
    }

    if (businessType) {
      if (businessType === 'building' || businessType.includes('building')) {
        filter.businessType = { $in: ['building', 'building_materials', 'buildingMaterials'] };
      } else {
        filter.$and = [{ businessType: {$in: ['pharmacy', null, undefined] } }];
      }
    }

    const orders = await Order.find(filter);
    const now = new Date();
    const todayStr = getLocalTodayDate();

    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(); startOfWeek.setDate(now.getDate() - now.getDay()); startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    let stats = {
      dailySales: 0, dailyProfit: 0,
      weeklySales: 0, weeklyProfit: 0,
      monthlySales: 0, monthlyProfit: 0,
      yearlySales: 0, yearlyProfit: 0,
      totalSales: 0, totalProfit: 0
    };

    orders.forEach((order) => {
      const orderDate = new Date(order.createdAt || order.soldAtDate);
      const grandTotal = Number(order.grandTotal || order.subtotal || order.total || 0);

      let orderProfit = 0;
      if (typeof order.profit === 'number' && !isNaN(order.profit)) {
        orderProfit = order.profit;
      } else if (order.items && Array.isArray(order.items)) {
        orderProfit = order.items.reduce((acc, item) => {
          const sellPrice = Number(item.price || item.customPrice || 0);
          const cost = Number(item.boughtPrice ?? item.costPrice ?? 0);
          const qty = Number(item.cartQty || item.quantity || 1);
          return acc + (sellPrice - cost) * qty;
        }, 0) - Number(order.discountAmount || order.discountValue || 0);
      }

      stats.totalSales += grandTotal;
      stats.totalProfit += orderProfit;

      const orderDateStr = order.soldAtDate || orderDate.toISOString().split('T')[0];
      if (orderDateStr === todayStr || orderDate >= startOfToday) {
        stats.dailySales += grandTotal;
        stats.dailyProfit += orderProfit;
      }
      if (orderDate >= startOfWeek) {
        stats.weeklySales += grandTotal;
        stats.weeklyProfit += orderProfit;
      }
      if (orderDate >= startOfMonth) {
        stats.monthlySales += grandTotal;
        stats.monthlyProfit += orderProfit;
      }
      if (orderDate >= startOfYear) {
        stats.yearlySales += grandTotal;
        stats.yearlyProfit += orderProfit;
      }
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error in analytics', details: err.message });
  }
};