const Order = require('../models/Order');

// Get YYYY-MM-DD in Ethiopian Local Timezone (UTC+3)
const getLocalTodayDate = () => {
  const now = new Date();
  const local = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // Ethiopian Offset UTC+3
  return local.toISOString().split('T')[0];
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
        filter.$and = [{ businessType: { $in: ['pharmacy', null, undefined] } }];
      }
    }

    const orders = await Order.find(filter);

    // Calculate dates in UTC+3 (Ethiopian Local Time)
    const now = new Date();
    const localNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));

    // Daily Range
    const startOfToday = new Date(localNow);
    startOfToday.setUTCHours(0, 0, 0, 0);

    // Weekly Range (Monday as Start of Week)
    const startOfWeek = new Date(localNow);
    const dayIndex = localNow.getUTCDay(); // 0 is Sun, 1 is Mon
    const diffToMonday = (dayIndex === 0 ? -6 : 1 - dayIndex);
    startOfWeek.setUTCDate(localNow.getUTCDate() + diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // Monthly Range
    const startOfMonth = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), 1));

    // Yearly Range
    const startOfYear = new Date(Date.UTC(localNow.getUTCFullYear(), 0, 1));

    let stats = {
      dailySales: 0, dailyProfit: 0,
      weeklySales: 0, weeklyProfit: 0,
      monthlySales: 0, monthlyProfit: 0,
      yearlySales: 0, yearlyProfit: 0,
      totalSales: 0, totalProfit: 0,
      weeklyBreakdown: Array(7).fill(0).map((_, i) => ({ sales: 0, profit: 0 })),
      monthlyBreakdown: Array(4).fill(0).map((_, i) => ({ sales: 0, profit: 0 })),
      yearlyBreakdown: Array(12).fill(0).map((_, i) => ({ sales: 0, profit: 0 }))
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

      // Total All-Time
      stats.totalSales += grandTotal;
      stats.totalProfit += orderProfit;

      // Daily
      if (orderDate >= startOfToday) {
        stats.dailySales += grandTotal;
        stats.dailyProfit += orderProfit;
      }

      // Weekly & Breakdown
      if (orderDate >= startOfWeek) {
        stats.weeklySales += grandTotal;
        stats.weeklyProfit += orderProfit;

        const dayIdx = (orderDate.getUTCDay() + 6) % 7; // Monday = 0
        if (stats.weeklyBreakdown[dayIdx]) {
          stats.weeklyBreakdown[dayIdx].sales += grandTotal;
          stats.weeklyBreakdown[dayIdx].profit += orderProfit;
        }
      }

      // Monthly & Breakdown
      if (orderDate >= startOfMonth) {
        stats.monthlySales += grandTotal;
        stats.monthlyProfit += orderProfit;

        const weekIdx = Math.min(Math.floor((orderDate.getUTCDate() - 1) / 7), 3);
        if (stats.monthlyBreakdown[weekIdx]) {
          stats.monthlyBreakdown[weekIdx].sales += grandTotal;
          stats.monthlyBreakdown[weekIdx].profit += orderProfit;
        }
      }

      // Yearly & Breakdown
      if (orderDate >= startOfYear) {
        stats.yearlySales += grandTotal;
        stats.yearlyProfit += orderProfit;

        const monthIdx = orderDate.getUTCMonth(); // 0 to 11
        if (stats.yearlyBreakdown[monthIdx]) {
          stats.yearlyBreakdown[monthIdx].sales += grandTotal;
          stats.yearlyBreakdown[monthIdx].profit += orderProfit;
        }
      }
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Server error in analytics', details: err.message });
  }
};