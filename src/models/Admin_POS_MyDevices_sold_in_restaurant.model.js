const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminPOSMyDevicesSoldInRestaurantSchema = new mongoose.Schema({
  Admin_MyDevices_sold_in_restaurant_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  MyDevices_id: {
    type: Number,
    ref: 'MyDevices',
    required: true
  },
  isAcitve: {
    type: Boolean,
    default: false
  },
  Trangeciton_id: {
    type: Number,
    ref: 'Transaction',
    default: null
  },
  paymentState: {
    type: Boolean,
    default: false
  },
  PrintersCount: {
    type: Number,
    default: 0
  },
  SystemsCount: {
    type: Number,
    default: 0
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

// Auto-increment for Admin_MyDevices_sold_in_restaurant_id
adminPOSMyDevicesSoldInRestaurantSchema.plugin(AutoIncrement, { inc_field: 'Admin_MyDevices_sold_in_restaurant_id' });

module.exports = mongoose.model('Admin_POS_MyDevices_sold_in_restaurant', adminPOSMyDevicesSoldInRestaurantSchema);

