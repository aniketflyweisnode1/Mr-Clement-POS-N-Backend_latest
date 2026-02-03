const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const printSettingsSchema = new mongoose.Schema({
  Print_Settings_id: {
    type: Number,
    unique: true,
    auto: true
  },
  enable_print: {
    type: Boolean,
    default: true
  },
  show_store_details: {
    type: Boolean,
    default: true
  },
  show_customer_details: {
    type: Boolean,
    default: true
  },
  store_id: {
    type: Number,
    ref: 'Store_details'
  },
  customer_id: {
    type: Number,
    ref: 'Customer'
  },
  pagesize: {
    type: String,
    default: 'A4'
  },
  Header: {
    type: String,
    default: null
  },
  footer: {
    type: String,
    default: null
  },
  show_notes: {
    type: Boolean,
    default: true
  },
  printToken: {
    type: Boolean,
    default: true
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

// Auto-increment for Print_Settings_id
printSettingsSchema.plugin(AutoIncrement, { inc_field: 'Print_Settings_id' });

module.exports = mongoose.model('Print_Settings', printSettingsSchema);
