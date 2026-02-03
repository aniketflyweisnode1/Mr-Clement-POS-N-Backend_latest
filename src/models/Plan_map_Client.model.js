const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const planMapClientSchema = new mongoose.Schema({
  Plan_map_Client_id: {
    type: Number,
    unique: true,
    auto: true
  },
  client_id: {
    type: Number,
    ref: 'Clients',
    required: true
  },
  plan_id: {
    type: Number,
    ref: 'Plan',
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
  PlanExpiryDate: {
    type: Date,
    default: null
  },
  PaymentStatus: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  Status: {
    type: Boolean,
    default: true
  },
  CreateBy: {
    type: Number,
    ref: 'User'
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
  },
  Two_Weeks_ago: {
    type: Boolean,
    default: false
  },
  one_Weeks_ago: {
    type: Boolean,
    default: false
  },
  One_Day_ago: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for Plan_map_Client_id
planMapClientSchema.plugin(AutoIncrement, { inc_field: 'Plan_map_Client_id' });

module.exports = mongoose.model('Plan_map_Client', planMapClientSchema);
