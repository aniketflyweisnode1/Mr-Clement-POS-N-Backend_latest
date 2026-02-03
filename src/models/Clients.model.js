const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const clientsSchema = new mongoose.Schema({
  Clients_id: {
    type: Number,
    unique: true,
    auto: true
  },
  Business_Name: {
    type: String,
    required: true,
    trim: true
  },
  Business_logo: {
    type: String,
    default: null
  },
  Email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  language: [{
    type: Number,
    ref: 'Language'
  }],
  currency: [{
    type: Number,
    ref: 'currency'
  }],
  type: {
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

// Auto-increment for Clients_id
clientsSchema.plugin(AutoIncrement, { inc_field: 'Clients_id' });

module.exports = mongoose.model('Clients', clientsSchema);
