const Order = require('../models/Order');
const { ethToGreg, gregToEth } = require('ethiopian-calendar-date-converter');

exports.getDailyHistory = async (req, res) => {
  try {
    const { businessType } = req.query;

    let filter = {};
    if (req.user && req.user.id) {
      filter.user = req.user.id;
    }

    if (businessType) {
      if (businessType === 'building' || businessType === 'building_materials') {
        filter.businessType = { $in: ['building', 'building_materials', 'buildingMaterials'] };
      } else {
        filter.businessType = { $in: ['pharmacy', null, undefined] };
      }
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

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

      const grandTotal = order.grandTotal || order.subtotal || order.total || 0;
      historyMap[dateKey].totalSales += grandTotal;

      let orderProfit = 0;
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const sellPrice = Number(item.price || item.unitPrice || 0);
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