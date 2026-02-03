const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const tableTypesSchema = new mongoose.Schema({
  Table_types_id: {
    type: Number,
    unique: true,
    auto: true
  },
  emozi: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    default: null
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String,
    default: null
  },
  table_size: {
    type: String,
    default: "20*20"
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

// Auto-increment for Table_types_id
tableTypesSchema.plugin(AutoIncrement, { inc_field: 'Table_types_id' });

module.exports = mongoose.model('Table_types', tableTypesSchema);
