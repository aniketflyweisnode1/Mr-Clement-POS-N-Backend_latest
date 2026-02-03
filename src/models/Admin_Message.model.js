const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminMessageSchema = new mongoose.Schema({
  Admin_Message_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Admin_MessageType: {
    type: Number,
    ref: 'Admin_MessageType',
    required: true
  },
  Message: {
    type: String,
    required: true,
    trim: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  SubscriptionDetails: [{
    CurrentPlanId: {
      type: Number,
      default: null
    },
    PurchesedDate: {
      type: Date
    },
    RenewalDate: {
      type: Date
    },
    firstPurchesON: {
      type: Date
    },
    NoofRenewals: {
      type: Number,
      default: 0
    }
  }],
  SchuduleDate: {
    type: Date,
    required: true
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

// Auto-increment for Admin_Message_id
adminMessageSchema.plugin(AutoIncrement, { inc_field: 'Admin_Message_id' });

module.exports = mongoose.model('Admin_Message', adminMessageSchema);

