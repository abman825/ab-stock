const Order = require('../models/Order');
const { ethToGreg, gregToEth } = require('ethiopian-calendar-date-converter');

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

    // 1. የኢትዮጵያ UTC+3 ሰዓት ማስተካከያ (EAT Time Zone)
    const now = new Date();
    const localNow = new Date(now.getTime() + (3 * 60 * 60 * 1000));

    // የዛሬውን ቀን በኢትዮጵያ አቆጣጠር ማግኘት
    const [ethYear, ethMonth, ethDay] = gregToEth(
      localNow.getUTCFullYear(),
      localNow.getUTCMonth() + 1,
      localNow.getUTCDate()
    );

    // --- ሀ. የዛሬ ጅምር (Start of Today) ---
    const startOfToday = new Date(localNow);
    startOfToday.setUTCHours(0, 0, 0, 0);

    // --- ለ. የሳምንት ጅምር (Start of Week - ሰኞ በኢትዮጵያ ሰዓት) ---
    const startOfWeek = new Date(localNow);
    const dayIndex = localNow.getUTCDay(); // 0 = እሁድ, 1 = ሰኞ
    const diffToMonday = (dayIndex === 0 ? -6 : 1 - dayIndex);
    startOfWeek.setUTCDate(localNow.getUTCDate() + diffToMonday);
    startOfWeek.setUTCHours(0, 0, 0, 0);

    // --- ሐ. የኢትዮጵያ ወር ጅምር (Start of Ethiopian Month - 1ኛ ቀን) ---
    const [gregStartYear, gregStartMonth, gregStartDay] = ethToGreg(ethYear, ethMonth, 1);
    const startOfEthMonth = new Date(Date.UTC(gregStartYear, gregStartMonth - 1, gregStartDay, 0, 0, 0));

    // --- መ. የኢትዮጵያ ዓመት ጅምር (Start of Ethiopian Year - መስከረም 1) ---
    const [gregYrStartYear, gregYrStartMonth, gregYrStartDay] = ethToGreg(ethYear, 1, 1);
    const startOfEthYear = new Date(Date.UTC(gregYrStartYear, gregYrStartMonth - 1, gregYrStartDay, 0, 0, 0));

    let stats = {
      dailySales: 0, dailyProfit: 0,
      weeklySales: 0, weeklyProfit: 0,
      monthlySales: 0, monthlyProfit: 0,
      yearlySales: 0, yearlyProfit: 0,
      totalSales: 0, totalProfit: 0,
      weeklyBreakdown: Array(7).fill(null).map(() => ({ sales: 0, profit: 0 })),
      monthlyBreakdown: Array(5).fill(null).map(() => ({ sales: 0, profit: 0 })), // የኢትዮጵያ ወር እስከ 30 ቀን ስለሆነ 5 ሳምንታት ይኖሩታል
      yearlyBreakdown: Array(13).fill(null).map(() => ({ sales: 0, profit: 0 }))  // ጳጉሜን ጨምሮ 13 ወራት
    };

    orders.forEach((order) => {
      const rawDate = new Date(order.createdAt || order.soldAtDate);
      // Order Date ን ወደ ኢትዮጵያ UTC+3 አቆጣጠር መቀየር
      const orderDate = new Date(rawDate.getTime() + (3 * 60 * 60 * 1000));
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

      // 1. የዛሬ (Daily)
      if (orderDate >= startOfToday) {
        stats.dailySales += grandTotal;
        stats.dailyProfit += orderProfit;
      }

      // 2. የሳምንት (Weekly - ከሰኞ ጀምሮ)
      if (orderDate >= startOfWeek) {
        stats.weeklySales += grandTotal;
        stats.weeklyProfit += orderProfit;

        const dayIdx = (orderDate.getUTCDay() + 6) % 7; // ሰኞ = 0
        if (stats.weeklyBreakdown[dayIdx]) {
          stats.weeklyBreakdown[dayIdx].sales += grandTotal;
          stats.weeklyBreakdown[dayIdx].profit += orderProfit;
        }
      }

      // 3. የኢትዮጵያ ወር (Monthly)
      if (orderDate >= startOfEthMonth) {
        stats.monthlySales += grandTotal;
        stats.monthlyProfit += orderProfit;

        // የትዕዛዙን የኢትዮጵያ ቀን ማግኘት
        const [, , orderEthDay] = gregToEth(
          orderDate.getUTCFullYear(),
          orderDate.getUTCMonth() + 1,
          orderDate.getUTCDate()
        );

        const weekIdx = Math.min(Math.floor((orderEthDay - 1) / 7), 4);
        if (stats.monthlyBreakdown[weekIdx]) {
          stats.monthlyBreakdown[weekIdx].sales += grandTotal;
          stats.monthlyBreakdown[weekIdx].profit += orderProfit;
        }
      }

      // 4. የኢትዮጵያ ዓመት (Yearly - ከመስከረም 1 ጀምሮ)
      if (orderDate >= startOfEthYear) {
        stats.yearlySales += grandTotal;
        stats.yearlyProfit += orderProfit;

        const [, orderEthMonth] = gregToEth(
          orderDate.getUTCFullYear(),
          orderDate.getUTCMonth() + 1,
          orderDate.getUTCDate()
        );

        const monthIdx = orderEthMonth - 1; // መስከረም = 0, ጥቅምት = 1 ...
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