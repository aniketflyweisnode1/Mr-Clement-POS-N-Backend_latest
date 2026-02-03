const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const tokensSchema = new mongoose.Schema({
  Token_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Token_no: {
    type: String,
    required: true,
    trim: true
  },
  TokenName: {
    type: String,
    required: true,
    trim: true
  },
  Details: {
    type: String,
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

// Auto-increment for Token_id
tokensSchema.plugin(AutoIncrement, { inc_field: 'Token_id' });

module.exports = mongoose.model('Tokens', tokensSchema);
