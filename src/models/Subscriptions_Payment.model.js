const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const subscriptionsPaymentSchema = new mongoose.Schema({
  Subscriptions_Payment_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Plan_map_Client_id: {
    type: Number,
    ref: 'Plan_map_Client',
    required: true
  },
  Transaction_id: {
    type: Number,
    ref: 'Transaction',
    default: null
  },
  PaymentType_id: {
    type: Number,
    ref: 'payment_type',
    default: null
  },
  Payment: {
    type: Number,
    ref: 'Payments',
    default: null
  },
  Payment_Options_id: {
    type: Number,
    ref: 'Payment_Options',
    default: null
  },
  PaymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
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
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for Subscriptions_Payment_id
subscriptionsPaymentSchema.plugin(AutoIncrement, { inc_field: 'Subscriptions_Payment_id' });

module.exports = mongoose.model('Subscriptions_Payment', subscriptionsPaymentSchema);

