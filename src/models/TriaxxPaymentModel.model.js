const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

/**
 * TRIAXX PAYMENT & REVENUE MODEL
 * 
 * Key Principle:
 * Triaxx DOES NOT handle end-customer money.
 * All payments go directly from Customer → Payment Provider → Merchant
 * Triaxx only RECORDS transactions for reporting purposes.
 * 
 * Triaxx Revenue Sources:
 * 1. POS Hardware Sales (one-time)
 * 2. Software Subscriptions (recurring)
 * 3. Optional Add-On Modules (recurring)
 * 4. Professional Services (one-time/contractual)
 */

// ============================================================================
// 1. HARDWARE SALES TRANSACTION (One-Time Revenue)
// ============================================================================
const hardwareSalesSchema = new mongoose.Schema({
  HardwareSale_id: {
    type: Number,
    unique: true
  },
  merchant_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  reseller_id: {
    type: Number,
    ref: 'User',
    default: null // Null if sold directly by Triaxx
  },
  hardware_type: {
    type: String,
    enum: ['POS_Terminal', 'Printer', 'KDS', 'Bundle'],
    required: true
  },
  hardware_model: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  discount_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  final_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method: {
    type: String,
    enum: ['Bank_Transfer', 'Card', 'Cash', 'Mobile_Money'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  invoice_number: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  delivery_date: {
    type: Date,
    default: null
  },
  warranty_months: {
    type: Number,
    default: 12,
    min: 0
  },
  warranty_expiry: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: '',
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

hardwareSalesSchema.plugin(AutoIncrement, { inc_field: 'HardwareSale_id' });

// ============================================================================
// 2. SOFTWARE SUBSCRIPTION (Recurring Revenue)
// ============================================================================
const softwareSubscriptionSchema = new mongoose.Schema({
  SoftwareSubscription_id: {
    type: Number,
    unique: true
  },
  merchant_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  plan_tier: {
    type: String,
    enum: ['Starter', 'Pro', 'Enterprise'],
    required: true
  },
  billing_cycle: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Annual'],
    required: true
  },
  monthly_price: {
    type: Number,
    required: true,
    min: 0
  },
  quarterly_price: {
    type: Number,
    default: 0,
    min: 0
  },
  annual_price: {
    type: Number,
    default: 0,
    min: 0
  },
  billing_price: {
    type: Number,
    required: true,
    min: 0
  },
  discount_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  final_billing_amount: {
    type: Number,
    required: true,
    min: 0
  },
  subscription_start_date: {
    type: Date,
    default: Date.now
  },
  subscription_end_date: {
    type: Date,
    required: true
  },
  next_billing_date: {
    type: Date,
    required: true
  },
  auto_renew: {
    type: Boolean,
    default: true
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  subscription_status: {
    type: String,
    enum: ['Active', 'Paused', 'Cancelled', 'Expired'],
    default: 'Active'
  },
  cancellation_date: {
    type: Date,
    default: null
  },
  cancellation_reason: {
    type: String,
    trim: true,
    default: ''
  },
  payment_method: {
    type: String,
    enum: ['Bank_Transfer', 'Card', 'Cash', 'Mobile_Money'],
    required: true
  },
  invoice_number: {
    type: String,
    unique: true,
    sparse: true,
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

softwareSubscriptionSchema.plugin(AutoIncrement, { inc_field: 'SoftwareSubscription_id' });

// ============================================================================
// 3. ADD-ON MODULES (Recurring Revenue)
// ============================================================================
const addOnModuleSchema = new mongoose.Schema({
  AddOnModule_id: {
    type: Number,
    unique: true
  },
  merchant_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  module_name: {
    type: String,
    enum: [
      'Mobile_Money_Integration',
      'Advanced_Analytics',
      'Inventory_Forecasting',
      'Accounting_Export',
      'Loyalty_CRM',
      'Customer_Feedback',
      'Multi_Language',
      'API_Access'
    ],
    required: true
  },
  module_description: {
    type: String,
    trim: true,
    default: ''
  },
  billing_cycle: {
    type: String,
    enum: ['Monthly', 'Annual'],
    required: true
  },
  monthly_price: {
    type: Number,
    required: true,
    min: 0
  },
  annual_price: {
    type: Number,
    default: 0,
    min: 0
  },
  billing_price: {
    type: Number,
    required: true,
    min: 0
  },
  discount_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  final_billing_amount: {
    type: Number,
    required: true,
    min: 0
  },
  subscription_start_date: {
    type: Date,
    default: Date.now
  },
  subscription_end_date: {
    type: Date,
    required: true
  },
  next_billing_date: {
    type: Date,
    required: true
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Cancelled'],
    default: 'Pending'
  },
  addon_status: {
    type: String,
    enum: ['Active', 'Suspended', 'Cancelled', 'Trial'],
    default: 'Active'
  },
  auto_renew: {
    type: Boolean,
    default: true
  },
  payment_method: {
    type: String,
    enum: ['Bank_Transfer', 'Card', 'Cash', 'Mobile_Money'],
    required: true
  },
  invoice_number: {
    type: String,
    unique: true,
    sparse: true,
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

addOnModuleSchema.plugin(AutoIncrement, { inc_field: 'AddOnModule_id' });

// ============================================================================
// 4. PROFESSIONAL SERVICES (One-Time/Contractual Revenue)
// ============================================================================
const professionalServicesSchema = new mongoose.Schema({
  ProfessionalService_id: {
    type: Number,
    unique: true
  },
  merchant_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  service_type: {
    type: String,
    enum: [
      'Installation',
      'Onboarding',
      'Training',
      'Data_Import',
      'Custom_Development',
      'Priority_Support_SLA'
    ],
    required: true
  },
  service_description: {
    type: String,
    trim: true,
    required: true
  },
  estimated_hours: {
    type: Number,
    required: true,
    min: 1
  },
  hourly_rate: {
    type: Number,
    required: true,
    min: 0
  },
  service_cost: {
    type: Number,
    required: true,
    min: 0
  },
  materials_cost: {
    type: Number,
    default: 0,
    min: 0
  },
  travel_cost: {
    type: Number,
    default: 0,
    min: 0
  },
  total_cost: {
    type: Number,
    required: true,
    min: 0
  },
  discount_percentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discount_amount: {
    type: Number,
    default: 0,
    min: 0
  },
  final_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_status: {
    type: String,
    enum: ['Pending', 'Partial', 'Completed', 'Refunded'],
    default: 'Pending'
  },
  service_status: {
    type: String,
    enum: ['Scheduled', 'In_Progress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  service_date: {
    type: Date,
    required: true
  },
  completion_date: {
    type: Date,
    default: null
  },
  assigned_technician_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  payment_method: {
    type: String,
    enum: ['Bank_Transfer', 'Card', 'Cash', 'Mobile_Money'],
    required: true
  },
  invoice_number: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  notes: {
    type: String,
    default: '',
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

professionalServicesSchema.plugin(AutoIncrement, { inc_field: 'ProfessionalService_id' });

// ============================================================================
// 5. CUSTOMER TRANSACTION (Recording Only - Money Stays with Merchant)
// ============================================================================
const customerTransactionSchema = new mongoose.Schema({
  CustomerTransaction_id: {
    type: Number,
    unique: true
  },
  merchant_id: {
    type: Number,
    ref: 'User',
    required: true
  },
  order_id: {
    type: Number,
    ref: 'Pos_Point_sales_Order',
    default: null
  },
  customer_id: {
    type: Number,
    ref: 'Customer',
    required: true
  },
  transaction_amount: {
    type: Number,
    required: true,
    min: 0
  },
  payment_method_used: {
    type: String,
    enum: ['Cash', 'Bank_Card', 'Mobile_Money', 'Wallet', 'Check'],
    required: true
  },
  payment_provider: {
    type: String,
    trim: true,
    default: ''
    // Example: "Vodafone Money", "MTN Mobile Money", "Visa", "Mastercard"
  },
  merchant_reference: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  provider_reference: {
    type: String,
    trim: true,
    default: ''
    // External provider's transaction ID
  },
  transaction_status: {
    type: String,
    enum: ['Pending', 'Success', 'Failed', 'Reversed'],
    default: 'Pending'
  },
  settlement_status: {
    type: String,
    enum: ['Not_Settled', 'Settled', 'Partially_Settled'],
    default: 'Not_Settled'
  },
  settlement_date: {
    type: Date,
    default: null
  },
  provider_fee: {
    type: Number,
    default: 0,
    min: 0
    // Fee charged by payment provider (merchant's responsibility)
  },
  merchant_receives: {
    type: Number,
    default: 0,
    min: 0
    // Amount after provider fee (merchant's net)
  },
  transaction_date: {
    type: Date,
    default: Date.now
  },
  currency: {
    type: String,
    default: 'XOF',
    trim: true
  },
  notes: {
    type: String,
    default: '',
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

customerTransactionSchema.plugin(AutoIncrement, { inc_field: 'CustomerTransaction_id' });

// ============================================================================
// 6. REVENUE SUMMARY (For Analytics)
// ============================================================================
const revenueSummarySchema = new mongoose.Schema({
  RevenueSummary_id: {
    type: Number,
    unique: true
  },
  summary_period: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual'],
    required: true
  },
  period_start_date: {
    type: Date,
    required: true
  },
  period_end_date: {
    type: Date,
    required: true
  },
  hardware_sales_count: {
    type: Number,
    default: 0,
    min: 0
  },
  hardware_sales_revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  active_subscriptions: {
    type: Number,
    default: 0,
    min: 0
  },
  subscription_revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  addon_modules_active: {
    type: Number,
    default: 0,
    min: 0
  },
  addon_modules_revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  professional_services_count: {
    type: Number,
    default: 0,
    min: 0
  },
  professional_services_revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  total_revenue: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'XOF',
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
  }
}, {
  timestamps: false,
  versionKey: false
});

revenueSummarySchema.plugin(AutoIncrement, { inc_field: 'RevenueSummary_id' });

// ============================================================================
// EXPORTS
// ============================================================================
module.exports = {
  HardwareSale: mongoose.model('HardwareSale', hardwareSalesSchema),
  SoftwareSubscription: mongoose.model('SoftwareSubscription', softwareSubscriptionSchema),
  AddOnModule: mongoose.model('AddOnModule', addOnModuleSchema),
  ProfessionalService: mongoose.model('ProfessionalService', professionalServicesSchema),
  CustomerTransaction: mongoose.model('CustomerTransaction', customerTransactionSchema),
  RevenueSummary: mongoose.model('RevenueSummary', revenueSummarySchema)
};
