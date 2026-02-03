const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminPlanBuyRestaurantSchema = new mongoose.Schema({
  Admin_Plan_buy_Restaurant_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Admin_Plan_id: {
    type: Number,
    ref: 'Admin_Plan',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  paymentStatus: {
    type: Boolean,
    default: false
  },
  Trangection_id: {
    type: Number,
    ref: 'Transaction' // Reference to transaction model (if exists)
  },
  expiry_date: {
    type: Date
  },
  paymentSuccessDate: {
    type: Date
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User',
    required: true
  },
  CreateAt: {
    type: Date,
    default: Date.now
  },
  UpdatedBy: {
    type: Number,
    ref: 'User'
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for Admin_Plan_buy_Restaurant_id
adminPlanBuyRestaurantSchema.plugin(AutoIncrement, { inc_field: 'Admin_Plan_buy_Restaurant_id' });

module.exports = mongoose.model('Admin_Plan_buy_Restaurant', adminPlanBuyRestaurantSchema);

