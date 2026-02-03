const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const quickOrderSchema = new mongoose.Schema({
  Quick_Order_id: {
    type: Number,
    unique: true,
    auto: true
  },
  'client_mobile_no': {
    type: String,
    required: true,
    trim: true
  },
  'get_order_Employee_id': {
    type: Number,
    ref: 'User',
    required: true
  },
  item_ids: [{
    item_id: {
      type: Number,
      ref: 'Items',
      required: true
    },
    itemName: {
      type: String,
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    }
  }],
  Floor_id: {
    type: Number,
    ref: 'Floor',
    required: true
  },
  Table_id: {
    type: Number,
    ref: 'Table',
    required: true
  },
  AddOnTable_id: {
    type: Number,
    ref: 'Table',
    default: null
  },
  Persons_Count: {
    type: Number,
    required: true,
    min: 1
  },
  Table_Booking_Status_id: {
    type: Number,
    ref: 'Table-Booking-Status',
    required: true
  },
  Wating_Time: {
    type: Number,
    default: 0,
    min: 0
  },
  Tax: {
    type: Number,
    default: 0,
    min: 0
  },
  SubTotal: {
    type: Number,
    required: true,
    min: 0
  },
  Total: {
    type: Number,
    required: true,
    min: 0
  },
  Order_Status: {
    type: String,
    enum: ['Preparing', 'Served', 'Cancelled'],
    default: 'Preparing'
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

// Auto-increment for Quick_Order_id
quickOrderSchema.plugin(AutoIncrement, { inc_field: 'Quick_Order_id' });

module.exports = mongoose.model('Quick_Order', quickOrderSchema);
