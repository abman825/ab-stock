const Order = require('../models/Order');

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

    const now = new Date();
    // የኢትዮጵያ ሰዓት አቆጣጠር (UTC + 3)
    const localNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));

    // የዛሬ
    const startOfToday = new Date(localNow);
    startOfToday.setUTCHours(0, 0, 0, 0);

    // የዚህ ሳምንት (ከሰኞ ጀምሮ)
    const startOfWeek = new Date(localNow);
    const dayIndex = localNow.getUTCDay(); 
    const diffToMonday = (dayIndex === 0 ? -6 : 1 - dayIndex);
    startOfWeek.setUTCDate(localNow.getUTCDate() + diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // የዚህ ወር
    const startOfMonth = new Date(Date.UTC(localNow.getUTCFullYear(), localNow.getUTCMonth(), 1));

    // የዚህ ዓመት
    const startOfYear = new Date(Date.UTC(localNow.getUTCFullYear(), 0, 1));

    let stats = {
      dailySales: 0, dailyProfit: 0,
      weeklySales: 0, weeklyProfit: 0,
      monthlySales: 0, monthlyProfit: 0,
      yearlySales: 0, yearlyProfit: 0,
      totalSales: 0, totalProfit: 0,
      weeklyBreakdown: Array(7).fill(null).map(() => ({ sales: 0, profit: 0 })),
      monthlyBreakdown: Array(4).fill(null).map(() => ({ sales: 0, profit: 0 })),
      yearlyBreakdown: Array(12).fill(null).map(() => ({ sales: 0, profit: 0 }))
    };

    // 1. መጀመሪያ በ LOOP ውስጥ ገብቶ ቀናቱን ይደምራል
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

      // አጠቃላይ
      stats.totalSales += grandTotal;
      stats.totalProfit += orderProfit;

      // ዛሬ
      if (orderDate >= startOfToday) {
        stats.dailySales += grandTotal;
        stats.dailyProfit += orderProfit;
      }

      // ሳምንት (ሰኞ = 0፣ ማክሰኞ = 1...)
      if (orderDate >= startOfWeek) {
        stats.weeklySales += grandTotal;
        stats.weeklyProfit += orderProfit;

        const dayIdx = (orderDate.getUTCDay() + 6) % 7;
        if (stats.weeklyBreakdown[dayIdx]) {
          stats.weeklyBreakdown[dayIdx].sales += grandTotal;
          stats.weeklyBreakdown[dayIdx].profit += orderProfit;
        }
      }

      // ወር
      if (orderDate >= startOfMonth) {
        stats.monthlySales += grandTotal;
        stats.monthlyProfit += orderProfit;

        const dayOfMonth = orderDate.getUTCDate();
        const weekIdx = Math.min(Math.floor((dayOfMonth - 1) / 7), 3);
        if (stats.monthlyBreakdown[weekIdx]) {
          stats.monthlyBreakdown[weekIdx].sales += grandTotal;
          stats.monthlyBreakdown[weekIdx].profit += orderProfit;
        }
      }

      // ዓመት
      if (orderDate >= startOfYear) {
        stats.yearlySales += grandTotal;
        stats.yearlyProfit += orderProfit;

        const monthIdx = orderDate.getUTCMonth();
        if (stats.yearlyBreakdown[monthIdx]) {
          stats.yearlyBreakdown[monthIdx].sales += grandTotal;
          stats.yearlyBreakdown[monthIdx].profit += orderProfit;
        }
      }
    });

    // 2. ስራውን ጨርሶ ከ LOOP በኋላ ለ Frontend ይልካል
    res.json(stats);

  } catch (err) {
    res.status(500).json({ error: 'Server error in analytics', details: err.message });
  }
};