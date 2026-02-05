const mongoose = require('mongoose');

const UserPreferencesSchema = new mongoose.Schema({
  user_id: {
    type: Number,
    required: true,
    ref: 'User'
  },
  language: {
    type: String,
    default: 'en'
  },
  theme: {
    type: String,
    default: 'light'
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  dashboard_layout: {
    type: String,
    default: 'compact'
  },
  quick_actions: {
    type: [String],
    default: []
  },
  UpdatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('User_Preferences', UserPreferencesSchema);