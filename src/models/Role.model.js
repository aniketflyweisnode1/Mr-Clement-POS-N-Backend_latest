const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const roleSchema = new mongoose.Schema({
  Role_id: {
    type: Number,
    unique: true,
    auto: true
  },
  role_name: {
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

// Auto-increment for Role_id
roleSchema.plugin(AutoIncrement, { inc_field: 'Role_id' });

module.exports = mongoose.model('Role', roleSchema);
