const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const businessSettingsSchema = new mongoose.Schema({
  Business_settings_id: {
    type: Number,
    unique: true,
    auto: true
  },
  subscriptionDetails: {
    type: Boolean,
    default: true
  },
  ActiveSubscriptions: {
    type: String,
    default: null,
    trim: true
  },
  inactiveSubscription: {
    type: String,
    default: null,
    trim: true
  },
  TurnOfSubscriptionPriceChange: {
    type: String,
    default: null,
    trim: true
  },
  BillHistory: {
    type: String,
    default: null,
    trim: true
  },
  allClients: {
    type: String,
    default: null,
    trim: true
  },
  NewClients: {
    type: String,
    default: null,
    trim: true
  },
  ActiveClients: {
    type: String,
    default: null,
    trim: true
  },
  InactiveClients: {
    type: String,
    default: null,
    trim: true
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
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for Business_settings_id
businessSettingsSchema.plugin(AutoIncrement, { inc_field: 'Business_settings_id' });

module.exports = mongoose.model('Business_settings', businessSettingsSchema);
