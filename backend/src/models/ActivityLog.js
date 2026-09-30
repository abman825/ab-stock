const mongoose = require('mongoose'); // 🔥 ይህ መስመር መኖሩን ያረጋግጡ

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    employeeName: {
        type: String,
        default: 'Unknown'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);