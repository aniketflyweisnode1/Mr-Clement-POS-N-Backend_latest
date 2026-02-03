const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const transactionSchema = new mongoose.Schema({
  transagtion_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'success', 'failed'],
    default: 'Pending'
  },
  payment_method: {
    type: String,
    required: true,
    trim: true
  },
  transactionType: {
    type: String,
    enum: ['Pending', 'Refund', 'Plan_Buy', 'Device_buy', 'Order_Payment'],
    default: 'Pending'
  },
  transaction_date: {
    type: Date,
    default: Date.now
  },
  reference_number: {
    type: String,
    trim: true
  },
  CGST: {
    type: Number,
    default: 0,
    min: 0
  },
  SGST: {
    type: Number,
    default: 0,
    min: 0
  },
  TotalGST: {
    type: Number,
    default: 0,
    min: 0
  },
  bank_id: {
    type: Number,
    ref: 'AdvisorBankAccountDetails'
  },
  PaymentDetails_id: {
    type: Number,
    ref: 'PaymentDetails',
    default: null
  },
  isDownloaded: {
    type: Boolean,
    default: false
  },
  fileDownlodedPath: {
    type: String,
    default: null,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  created_by: {
    type: Number,
    ref: 'User',
    required: true
  },
  updated_at: {
    type: Date
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for transagtion_id
transactionSchema.plugin(AutoIncrement, { inc_field: 'transagtion_id' });

module.exports = mongoose.model('Transaction', transactionSchema);

