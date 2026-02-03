const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminMessageWithClientSchema = new mongoose.Schema({
  Admin_Message_with_client_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  message_id: {
    type: Number,
    ref: 'Admin_Message',
    required: true
  },
  Message: {
    type: String,
    required: true,
    trim: true
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
  date: {
    type: Date,
    default: Date.now
  },
  time: {
    type: String,
    trim: true
  },
  IsRead: {
    type: Boolean,
    default: false
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

// Auto-increment for Admin_Message_with_client_id
adminMessageWithClientSchema.plugin(AutoIncrement, { inc_field: 'Admin_Message_with_client_id' });

module.exports = mongoose.model('Admin_Message_with_client', adminMessageWithClientSchema);

