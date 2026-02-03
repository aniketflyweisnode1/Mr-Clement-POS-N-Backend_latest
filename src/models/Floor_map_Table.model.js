const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const floorMapTableSchema = new mongoose.Schema({
  floor_map_Table_id: {
    type: Number,
    unique: true,
    auto: true
  },
  floor_id: {
    type: Number,
    ref: 'Floor',
    required: true
  },
  table_id: {
    type: Number,
    ref: 'Table',
    required: true
  },
  Row_No: {
    type: Number,
    default: null
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

// Auto-increment for floor_map_Table_id
floorMapTableSchema.plugin(AutoIncrement, { inc_field: 'floor_map_Table_id' });

module.exports = mongoose.model('Floor_map_Table', floorMapTableSchema);

