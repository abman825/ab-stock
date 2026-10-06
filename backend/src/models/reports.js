const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale'); // የSale ሞዴልህን የፋይል ፓዝ እዚህ ጋር አረጋግጥ

// GET Daily Sales & Profit History (ንግድ ከተጀመረበት ቀን ጀምሮ ያለውን በየቀኑ አድርጎ የሚያወጣ)
router.get('/daily-history', async (req, res) => {
  try {
    const { businessType } = req.query;

    let filter = {};
    if (businessType) {
      filter.businessType = businessType;
    }

    const dailyHistory = await Sale.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          date: { $first: "$createdAt" },
          totalSales: { $sum: "$grandTotal" },
          totalProfit: { $sum: "$netProfit" }
        }
      },
      { $sort: { date: -1 } } // ከአዲሱ ቀን ወደ ቆየው መደርደር
    ]);

    res.json(dailyHistory);
  } catch (error) {
    console.error("Daily history fetch error:", error);
    res.status(500).json({ message: "መረጃውን ማምጣት አልተቻለም" });
  }
});

module.exports = router;