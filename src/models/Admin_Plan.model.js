const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const adminPlanSchema = new mongoose.Schema({
  Admin_Plan_id: {
    type: Number,
    unique: true,
    auto: true
  },
  PlanName: {
    type: String,
    required: true,
    trim: true
  },
  Description: {
    type: String,
    trim: true
  },
  Price: {
    type: Number,
    required: true
  },
  expiry_day: {
    type: Date
  },
  fesility: [{
    fesilityLine: {
      type: String,
      trim: true
    },
    statue: {
      type: Boolean,
      default: false
    }
  }],
  Status: {
    type: Boolean,
    default: true
  },
  renewalMessage: {
    message: {
      type: String,
      trim: true
    },
    status: {
      type: Boolean,
      default: false
    },
    scheduledDate: {
      type: Date
    }
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

// Auto-increment for Admin_Plan_id
adminPlanSchema.plugin(AutoIncrement, { inc_field: 'Admin_Plan_id' });

module.exports = mongoose.model('Admin_Plan', adminPlanSchema);

