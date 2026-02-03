const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const restaurantSlotSchema = new mongoose.Schema({
  Restaurant_slot_id: {
    type: Number,
    unique: true,
    auto: true
  },
  user_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  slots: [{
    day: {
      type: String,
      required: true,
      trim: true
    },
    slot: [{
      from: {
        type: String,
        trim: true
      },
      to: {
        type: String,
        trim: true
      }
    }]
  }],
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

// Auto-increment for Restaurant_slot_id
restaurantSlotSchema.plugin(AutoIncrement, { inc_field: 'Restaurant_slot_id' });

module.exports = mongoose.model('Restaurant_slot', restaurantSlotSchema);

