const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const subAdminPermissionsSchema = new mongoose.Schema({
  SubAdmin_Permissions_id: {
    type: Number,
    unique: true,
    auto: true
  },
  User_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  IsPermissons: [{
    type: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: Boolean,
      default: false
    }
  }],
  role_id: {
    type: Number,
    ref: 'Role',
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

// Auto-increment for SubAdmin_Permissions_id
subAdminPermissionsSchema.plugin(AutoIncrement, { inc_field: 'SubAdmin_Permissions_id' });

module.exports = mongoose.model('SubAdmin_Permissions', subAdminPermissionsSchema);

