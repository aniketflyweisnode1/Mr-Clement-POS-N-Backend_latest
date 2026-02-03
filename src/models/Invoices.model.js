const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const invoicesSchema = new mongoose.Schema({
  Invoices_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Token_id: {
    type: Number,
    ref: 'Tokens'
  },
  order_id: {
    type: Number,
    ref: 'Quick_Order'
  },
  Delivery_type_id: {
    type: Number,
    ref: 'Delivery_type'
  },
  Customer_type: {
    type: Number,
    ref: 'Customer_type'
  },
  Table_id: {
    type: Number,
    ref: 'Table'
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

// Auto-increment for Invoices_id
invoicesSchema.plugin(AutoIncrement, { inc_field: 'Invoices_id' });

module.exports = mongoose.model('Invoices', invoicesSchema);
