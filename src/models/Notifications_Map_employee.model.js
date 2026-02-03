const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const notificationsMapEmployeeSchema = new mongoose.Schema({
  Notifications_Map_employee_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Notifications_id: {
    type: Number,
    ref: 'Notifications',
    required: true
  },
  employee_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
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

notificationsMapEmployeeSchema.plugin(AutoIncrement, { inc_field: 'Notifications_Map_employee_id' });

module.exports = mongoose.model('Notifications_Map_employee', notificationsMapEmployeeSchema);



