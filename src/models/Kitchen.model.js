const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const kitchenSchema = new mongoose.Schema({
  Kitchen_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Kitchen_type_id: {
    type: Number,
    ref: 'Kitchen_type',
    required: true
  },
  emozi: {
    type: String,
    required: true,
    trim: true
  },
  Name: {
    type: String,
    required: true,
    trim: true
  },
  token: {
    type: String,
    default: null
  },
  working_user_id: {
    type: Number,
    ref: 'User',
    required: true
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

// Auto-increment for Kitchen_id
kitchenSchema.plugin(AutoIncrement, { inc_field: 'Kitchen_id' });

module.exports = mongoose.model('Kitchen', kitchenSchema);
