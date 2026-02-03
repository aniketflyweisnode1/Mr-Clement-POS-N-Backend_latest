const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const floorSchema = new mongoose.Schema({
  Floor_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Floor_Type_id: {
    type: Number,
    ref: 'Floor_Type',
    required: true
  },
  Floor_Name: {
    type: String,
    required: true,
    trim: true
  },
  Total_Table_Count: {
    type: Number,
    required: true,
    min: 0
  },
  'Seating-Persons_Count': {
    type: Number,
    required: true,
    min: 0
  },
  Details: {
    type: String,
    default: null
  },
  floor_width: {
    type: String,
    default: "80"
  },
  floor_height: {
    type: String,
    default: "100"
  },
  floor_image: {
    type: String,
    default: ""
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

// Auto-increment for Floor_id
floorSchema.plugin(AutoIncrement, { inc_field: 'Floor_id' });

module.exports = mongoose.model('Floor', floorSchema);
