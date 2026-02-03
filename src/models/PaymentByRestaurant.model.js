const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const paymentByRestaurantSchema = new mongoose.Schema({
  PaymentByRestaurant_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Payment_Options_id: {
    type: Number,
    ref: 'Payment_Options',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Failed', 'Cancelled', 'Success'],
    default: 'Pending'
  },
  Trangection_id: {
    type: Number,
    ref: 'Transaction',
    default: null
  },
  Order_id: {
    type: Number,
    ref: 'Pos_Point_sales_Order',
    default: null
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
    ref: 'User',
    default: null
  },
  UpdatedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for PaymentByRestaurant_id
paymentByRestaurantSchema.plugin(AutoIncrement, { inc_field: 'PaymentByRestaurant_id' });

module.exports = mongoose.model('PaymentByRestaurant', paymentByRestaurantSchema);

