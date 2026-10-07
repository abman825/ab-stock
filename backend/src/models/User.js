const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, default: '' },
  phone: { type: String, default: '' },
  role: { type: String, default: 'User' },

  // የወርሃዊ ክፍያ መቆጣጠሪያዎች (Subscription Control)
  isActive: { 
    type: Boolean, 
    default: true 
  },
  nextPaymentDate: { 
    type: Date, 
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // ከተመዘገቡበት ቀን ጀምሮ 30 ቀን ይሰጣቸዋል
  },
  subscriptionPlan: { 
    type: String, 
    default: 'Monthly' 
  },

  // Forgot Password
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, { timestamps: true });

// Password Save ከመደረጉ በፊት Hash ማድረጊያ Middleware
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);