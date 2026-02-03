const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const permissionsTypeMapWithEmployeeSchema = new mongoose.Schema({
  Permissions_type_Map_with_Employee_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Permissions_type_id: {
    type: Number,
    ref: 'Permissions_type',
    required: true
  },
  user_id: {
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

// Auto-increment for Permissions_type_Map_with_Employee_id
permissionsTypeMapWithEmployeeSchema.plugin(AutoIncrement, { inc_field: 'Permissions_type_Map_with_Employee_id' });

module.exports = mongoose.model('Permissions_type_Map_with_Employee', permissionsTypeMapWithEmployeeSchema);
