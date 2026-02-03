const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const myDevicesSchema = new mongoose.Schema({
  MyDevices_id: {
    type: Number,
    unique: true
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  Devices_ModelNo: {
    type: String,
    default: null,
    trim: true
  },
  Devices_company: {
    type: String,
    default: null,
    trim: true
  },
  Devices_Operating_system: {
    type: String,
    default: null,
    trim: true
  },
  timeZone: {
    type: String,
    default: null,
    trim: true
  },
  Device_browser: {
    type: String,
    default: null,
    trim: true
  },
  location: {
    type: String,
    default: null,
    trim: true
  },
  IPAddress: {
    type: String,
    default: null,
    trim: true
  },
  price: {
    type: Number,
    default: 0
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

// Auto-increment for MyDevices_id
myDevicesSchema.plugin(AutoIncrement, { inc_field: 'MyDevices_id' });

module.exports = mongoose.model('MyDevices', myDevicesSchema);
