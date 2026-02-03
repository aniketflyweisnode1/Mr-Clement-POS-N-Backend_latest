const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const kitchenTypeSchema = new mongoose.Schema({
  Kitchen_type_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Emozi: {
    type: String,
    required: true,
    trim: true
  },
  Name: {
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
    default: Date.now
  }
}, {
  timestamps: false,
  versionKey: false
});

// Auto-increment for Kitchen_type_id
kitchenTypeSchema.plugin(AutoIncrement, { inc_field: 'Kitchen_type_id' });

module.exports = mongoose.model('Kitchen_type', kitchenTypeSchema);
