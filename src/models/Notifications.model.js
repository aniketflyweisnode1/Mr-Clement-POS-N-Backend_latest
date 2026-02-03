const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationsSchema = new mongoose.Schema({
  Notifications_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Notifications: {
    type: String,
    required: true,
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
    default: null
  }
}, {
  timestamps: false,
  versionKey: false
});

notificationsSchema.plugin(AutoIncrement, { inc_field: 'Notifications_id' });

module.exports = mongoose.model('Notifications', notificationsSchema);
