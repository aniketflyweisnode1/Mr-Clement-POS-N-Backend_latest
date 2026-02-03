const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');

// Import all models
const {
  HardwareSale,
  SoftwareSubscription,
  AddOnModule,
  ProfessionalService,
  CustomerTransaction,
  RevenueSummary
} = require('../../models/TriaxxPaymentModel.model');

/**
 * ============================================================================
 * 1. HARDWARE SALES ENDPOINTS
 * ============================================================================
 */

// Create hardware sale
router.post('/hardware-sales/create', auth, async (req, res) => {
  try {
    const {
      merchant_id,
      reseller_id,
      hardware_type,
      hardware_model,
      quantity,
      unit_price,
      discount_percentage = 0,
      payment_method,
      invoice_number,
      warranty_months = 12,
      notes
    } = req.body;

    // Validation
    if (!merchant_id || !hardware_type || !quantity || !unit_price || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: merchant_id, hardware_type, quantity, unit_price, payment_method'
      });
    }

    const total_amount = quantity * unit_price;
    const discount_amount = (total_amount * discount_percentage) / 100;
    const final_amount = total_amount - discount_amount;

    // Calculate warranty expiry
    const warranty_expiry = new Date();
    warranty_expiry.setMonth(warranty_expiry.getMonth() + warranty_months);

    const hardwareSale = new HardwareSale({
      merchant_id,
      reseller_id,
      hardware_type,
      hardware_model,
      quantity,
      unit_price,
      total_amount,
      discount_percentage,
      discount_amount,
      final_amount,
      payment_method,
      invoice_number,
      warranty_months,
      warranty_expiry,
      notes,
      CreateBy: req.user.user_id,
      Status: true
    });

    await hardwareSale.save();

    return res.status(201).json({
      success: true,
      message: 'Hardware sale recorded successfully',
      data: hardwareSale
    });
  } catch (error) {
    console.error('Hardware sale creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating hardware sale',
      error: error.message
    });
  }
});

// Get all hardware sales
router.get('/hardware-sales', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const sales = await HardwareSale.find({ Status: true })
      .skip(skip)
      .limit(limit)
      .sort({ CreateAt: -1 });

    const total = await HardwareSale.countDocuments({ Status: true });

    return res.status(200).json({
      success: true,
      message: 'Hardware sales retrieved successfully',
      data: sales,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch hardware sales error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching hardware sales',
      error: error.message
    });
  }
});

// Get specific hardware sale
router.get('/hardware-sales/:HardwareSale_id', auth, async (req, res) => {
  try {
    const sale = await HardwareSale.findOne({ HardwareSale_id: req.params.HardwareSale_id });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Hardware sale not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hardware sale retrieved successfully',
      data: sale
    });
  } catch (error) {
    console.error('Fetch hardware sale error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching hardware sale',
      error: error.message
    });
  }
});

// Update hardware sale status
router.put('/hardware-sales/:HardwareSale_id', auth, async (req, res) => {
  try {
    const { payment_status, delivery_date, notes } = req.body;

    const updatedSale = await HardwareSale.findOneAndUpdate(
      { HardwareSale_id: req.params.HardwareSale_id },
      {
        payment_status: payment_status || undefined,
        delivery_date: delivery_date || undefined,
        notes: notes || undefined,
        UpdatedBy: req.user.user_id,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    if (!updatedSale) {
      return res.status(404).json({
        success: false,
        message: 'Hardware sale not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hardware sale updated successfully',
      data: updatedSale
    });
  } catch (error) {
    console.error('Update hardware sale error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating hardware sale',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * 2. SOFTWARE SUBSCRIPTION ENDPOINTS
 * ============================================================================
 */

// Create subscription
router.post('/subscriptions/create', auth, async (req, res) => {
  try {
    const {
      merchant_id,
      plan_tier,
      billing_cycle,
      monthly_price,
      quarterly_price,
      annual_price,
      discount_percentage = 0,
      payment_method,
      auto_renew = true
    } = req.body;

    // Validation
    if (!merchant_id || !plan_tier || !billing_cycle || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Determine billing price based on cycle
    let billing_price;
    if (billing_cycle === 'Monthly') billing_price = monthly_price;
    else if (billing_cycle === 'Quarterly') billing_price = quarterly_price;
    else if (billing_cycle === 'Annual') billing_price = annual_price;

    if (!billing_price) {
      return res.status(400).json({
        success: false,
        message: `Price not provided for ${billing_cycle} billing cycle`
      });
    }

    const discount_amount = (billing_price * discount_percentage) / 100;
    const final_billing_amount = billing_price - discount_amount;

    // Calculate dates
    const subscription_start_date = new Date();
    const subscription_end_date = new Date();
    if (billing_cycle === 'Monthly') subscription_end_date.setMonth(subscription_end_date.getMonth() + 1);
    else if (billing_cycle === 'Quarterly') subscription_end_date.setMonth(subscription_end_date.getMonth() + 3);
    else if (billing_cycle === 'Annual') subscription_end_date.setFullYear(subscription_end_date.getFullYear() + 1);

    const subscription = new SoftwareSubscription({
      merchant_id,
      plan_tier,
      billing_cycle,
      monthly_price,
      quarterly_price,
      annual_price,
      billing_price,
      discount_percentage,
      discount_amount,
      final_billing_amount,
      subscription_start_date,
      subscription_end_date,
      next_billing_date: subscription_end_date,
      auto_renew,
      payment_method,
      subscription_status: 'Active',
      payment_status: 'Pending',
      CreateBy: req.user.user_id,
      Status: true
    });

    await subscription.save();

    return res.status(201).json({
      success: true,
      message: 'Software subscription created successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Subscription creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating subscription',
      error: error.message
    });
  }
});

// Get all subscriptions
router.get('/subscriptions', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status || 'Active';

    const subscriptions = await SoftwareSubscription.find({ subscription_status: status, Status: true })
      .skip(skip)
      .limit(limit)
      .sort({ CreateAt: -1 });

    const total = await SoftwareSubscription.countDocuments({ subscription_status: status, Status: true });

    return res.status(200).json({
      success: true,
      message: 'Subscriptions retrieved successfully',
      data: subscriptions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch subscriptions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
});

// Get specific subscription
router.get('/subscriptions/:SoftwareSubscription_id', auth, async (req, res) => {
  try {
    const { SoftwareSubscription_id } = req.params;

    if (!SoftwareSubscription_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing subscription ID'
      });
    }

    const subscription = await SoftwareSubscription.findOne({ SoftwareSubscription_id: parseInt(SoftwareSubscription_id) });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription retrieved successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Fetch subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching subscription',
      error: error.message
    });
  }
});

// Update subscription
router.put('/subscriptions/:SoftwareSubscription_id', auth, async (req, res) => {
  try {
    const { SoftwareSubscription_id } = req.params;
    const { plan_tier, billing_cycle, monthly_price, quarterly_price, annual_price, discount_percentage, auto_renew, subscription_status } = req.body;

    if (!SoftwareSubscription_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing subscription ID'
      });
    }

    // Calculate billing price if cycle changed
    let updateData = {
      UpdatedBy: req.user.user_id,
      UpdatedAt: new Date()
    };

    if (plan_tier) updateData.plan_tier = plan_tier;
    if (billing_cycle) updateData.billing_cycle = billing_cycle;
    if (monthly_price) updateData.monthly_price = monthly_price;
    if (quarterly_price) updateData.quarterly_price = quarterly_price;
    if (annual_price) updateData.annual_price = annual_price;
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage;
    if (auto_renew !== undefined) updateData.auto_renew = auto_renew;
    if (subscription_status) updateData.subscription_status = subscription_status;

    const subscription = await SoftwareSubscription.findOneAndUpdate(
      { SoftwareSubscription_id: parseInt(SoftwareSubscription_id) },
      updateData,
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating subscription',
      error: error.message
    });
  }
});

// Cancel subscription
router.post('/subscriptions/:SoftwareSubscription_id/cancel', auth, async (req, res) => {
  try {
    const { cancellation_reason } = req.body;

    const subscription = await SoftwareSubscription.findOneAndUpdate(
      { SoftwareSubscription_id: req.params.SoftwareSubscription_id },
      {
        subscription_status: 'Cancelled',
        cancellation_date: new Date(),
        cancellation_reason,
        UpdatedBy: req.user.user_id,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription cancelled successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error cancelling subscription',
      error: error.message
    });
  }
});

// Renew/Extend subscription
router.post('/subscriptions/:SoftwareSubscription_id/renew', auth, async (req, res) => {
  try {
    const { SoftwareSubscription_id } = req.params;

    const subscription = await SoftwareSubscription.findOne({
      SoftwareSubscription_id: parseInt(SoftwareSubscription_id)
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Calculate new billing dates
    const current_end_date = new Date(subscription.subscription_end_date);
    const new_start_date = new Date(current_end_date);
    new_start_date.setDate(new_start_date.getDate() + 1);

    const new_end_date = new Date(new_start_date);
    if (subscription.billing_cycle === 'Monthly') {
      new_end_date.setMonth(new_end_date.getMonth() + 1);
    } else if (subscription.billing_cycle === 'Quarterly') {
      new_end_date.setMonth(new_end_date.getMonth() + 3);
    } else if (subscription.billing_cycle === 'Annual') {
      new_end_date.setFullYear(new_end_date.getFullYear() + 1);
    }

    // Update subscription with new period
    const updatedSubscription = await SoftwareSubscription.findOneAndUpdate(
      { SoftwareSubscription_id: parseInt(SoftwareSubscription_id) },
      {
        subscription_start_date: new_start_date,
        subscription_end_date: new_end_date,
        next_billing_date: new_end_date,
        subscription_status: 'Active',
        payment_status: 'Pending',
        UpdatedBy: req.user.user_id,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Subscription renewed successfully',
      data: {
        renewal_info: {
          previous_period_end: current_end_date,
          new_period_start: new_start_date,
          new_period_end: new_end_date,
          billing_cycle: subscription.billing_cycle,
          billing_amount: subscription.billing_price,
          discount_amount: subscription.discount_amount,
          final_amount: subscription.final_billing_amount
        },
        updated_subscription: updatedSubscription
      }
    });
  } catch (error) {
    console.error('Renew subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error renewing subscription',
      error: error.message
    });
  }
});

// Pause subscription temporarily
router.post('/subscriptions/:SoftwareSubscription_id/pause', auth, async (req, res) => {
  try {
    const { SoftwareSubscription_id } = req.params;
    const { pause_reason, pause_duration_days = 30 } = req.body;

    const subscription = await SoftwareSubscription.findOne({
      SoftwareSubscription_id: parseInt(SoftwareSubscription_id)
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (subscription.subscription_status === 'Paused') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already paused'
      });
    }

    // Calculate pause end date
    const pause_start_date = new Date();
    const pause_end_date = new Date();
    pause_end_date.setDate(pause_end_date.getDate() + pause_duration_days);

    // Update subscription to paused state
    const updatedSubscription = await SoftwareSubscription.findOneAndUpdate(
      { SoftwareSubscription_id: parseInt(SoftwareSubscription_id) },
      {
        subscription_status: 'Paused',
        pause_start_date,
        pause_end_date,
        pause_reason,
        UpdatedBy: req.user.user_id,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Subscription paused successfully',
      data: {
        pause_info: {
          pause_start_date,
          pause_end_date,
          pause_duration_days,
          pause_reason,
          resumption_date: pause_end_date
        },
        subscription_status: updatedSubscription.subscription_status
      }
    });
  } catch (error) {
    console.error('Pause subscription error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error pausing subscription',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * 3. ADD-ON MODULES ENDPOINTS
 * ============================================================================
 */

// Create add-on module
router.post('/addons/create', auth, async (req, res) => {
  try {
    const {
      merchant_id,
      module_name,
      billing_cycle,
      monthly_price,
      annual_price,
      discount_percentage = 0,
      payment_method,
      auto_renew = true
    } = req.body;

    // Validation
    if (!merchant_id || !module_name || !billing_cycle || !payment_method) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const billing_price = billing_cycle === 'Monthly' ? monthly_price : annual_price;
    const discount_amount = (billing_price * discount_percentage) / 100;
    const final_billing_amount = billing_price - discount_amount;

    // Calculate dates
    const subscription_start_date = new Date();
    const subscription_end_date = new Date();
    if (billing_cycle === 'Monthly') subscription_end_date.setMonth(subscription_end_date.getMonth() + 1);
    else subscription_end_date.setFullYear(subscription_end_date.getFullYear() + 1);

    const addon = new AddOnModule({
      merchant_id,
      module_name,
      billing_cycle,
      monthly_price,
      annual_price,
      billing_price,
      discount_percentage,
      discount_amount,
      final_billing_amount,
      subscription_start_date,
      subscription_end_date,
      next_billing_date: subscription_end_date,
      auto_renew,
      payment_method,
      addon_status: 'Active',
      payment_status: 'Pending',
      CreateBy: req.user.user_id,
      Status: true
    });

    await addon.save();

    return res.status(201).json({
      success: true,
      message: 'Add-on module activated successfully',
      data: addon
    });
  } catch (error) {
    console.error('Add-on creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating add-on module',
      error: error.message
    });
  }
});

// Get all add-ons
router.get('/addons', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const merchant_id = req.query.merchant_id;

    const query = { Status: true };
    if (merchant_id) query.merchant_id = merchant_id;

    const addons = await AddOnModule.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ CreateAt: -1 });

    const total = await AddOnModule.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Add-on modules retrieved successfully',
      data: addons,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch add-ons error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching add-on modules',
      error: error.message
    });
  }
});

// Get specific add-on module
router.get('/addons/:AddOnModule_id', auth, async (req, res) => {
  try {
    const { AddOnModule_id } = req.params;

    if (!AddOnModule_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing add-on module ID'
      });
    }

    const addon = await AddOnModule.findOne({ AddOnModule_id: parseInt(AddOnModule_id) });

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: 'Add-on module not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Add-on module retrieved successfully',
      data: addon
    });
  } catch (error) {
    console.error('Fetch add-on error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching add-on module',
      error: error.message
    });
  }
});

// Update add-on module
router.put('/addons/:AddOnModule_id', auth, async (req, res) => {
  try {
    const { AddOnModule_id } = req.params;
    const { billing_cycle, monthly_price, annual_price, discount_percentage, auto_renew, addon_status } = req.body;

    if (!AddOnModule_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing add-on module ID'
      });
    }

    let updateData = {
      UpdatedBy: req.user.user_id,
      UpdatedAt: new Date()
    };

    if (billing_cycle) updateData.billing_cycle = billing_cycle;
    if (monthly_price) updateData.monthly_price = monthly_price;
    if (annual_price) updateData.annual_price = annual_price;
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage;
    if (auto_renew !== undefined) updateData.auto_renew = auto_renew;
    if (addon_status) updateData.addon_status = addon_status;

    const addon = await AddOnModule.findOneAndUpdate(
      { AddOnModule_id: parseInt(AddOnModule_id) },
      updateData,
      { new: true }
    );

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: 'Add-on module not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Add-on module updated successfully',
      data: addon
    });
  } catch (error) {
    console.error('Add-on update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating add-on module',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * 4. PROFESSIONAL SERVICES ENDPOINTS
 * ============================================================================
 */

// Create professional service
router.post('/services/create', auth, async (req, res) => {
  try {
    const {
      merchant_id,
      service_type,
      service_description,
      estimated_hours,
      hourly_rate,
      materials_cost = 0,
      travel_cost = 0,
      discount_percentage = 0,
      payment_method,
      service_date,
      assigned_technician_id
    } = req.body;

    // Validation
    if (!merchant_id || !service_type || !estimated_hours || !hourly_rate || !payment_method || !assigned_technician_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const service_cost = estimated_hours * hourly_rate;
    const total_cost = service_cost + materials_cost + travel_cost;
    const discount_amount = (total_cost * discount_percentage) / 100;
    const final_amount = total_cost - discount_amount;

    const service = new ProfessionalService({
      merchant_id,
      service_type,
      service_description,
      estimated_hours,
      hourly_rate,
      service_cost,
      materials_cost,
      travel_cost,
      total_cost,
      discount_percentage,
      discount_amount,
      final_amount,
      payment_method,
      service_date,
      assigned_technician_id,
      payment_status: 'Pending',
      service_status: 'Scheduled',
      CreateBy: req.user.user_id,
      Status: true
    });

    await service.save();

    return res.status(201).json({
      success: true,
      message: 'Professional service scheduled successfully',
      data: service
    });
  } catch (error) {
    console.error('Service creation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating professional service',
      error: error.message
    });
  }
});

// Get all services
router.get('/services', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const services = await ProfessionalService.find({ Status: true })
      .skip(skip)
      .limit(limit)
      .sort({ service_date: -1 });

    const total = await ProfessionalService.countDocuments({ Status: true });

    return res.status(200).json({
      success: true,
      message: 'Professional services retrieved successfully',
      data: services,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch services error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching professional services',
      error: error.message
    });
  }
});

// Get specific professional service
router.get('/services/:ProfessionalService_id', auth, async (req, res) => {
  try {
    const { ProfessionalService_id } = req.params;

    if (!ProfessionalService_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing professional service ID'
      });
    }

    const service = await ProfessionalService.findOne({ ProfessionalService_id: parseInt(ProfessionalService_id) });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Professional service not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional service retrieved successfully',
      data: service
    });
  } catch (error) {
    console.error('Fetch service error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching professional service',
      error: error.message
    });
  }
});

// Update professional service
router.put('/services/:ProfessionalService_id', auth, async (req, res) => {
  try {
    const { ProfessionalService_id } = req.params;
    const { service_status, service_date, estimated_hours, hourly_rate, materials_cost, travel_cost, discount_percentage } = req.body;

    if (!ProfessionalService_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing professional service ID'
      });
    }

    let updateData = {
      UpdatedBy: req.user.user_id,
      UpdatedAt: new Date()
    };

    if (service_status) updateData.service_status = service_status;
    if (service_date) updateData.service_date = service_date;
    if (estimated_hours) updateData.estimated_hours = estimated_hours;
    if (hourly_rate) updateData.hourly_rate = hourly_rate;
    if (materials_cost !== undefined) updateData.materials_cost = materials_cost;
    if (travel_cost !== undefined) updateData.travel_cost = travel_cost;
    if (discount_percentage !== undefined) updateData.discount_percentage = discount_percentage;

    const service = await ProfessionalService.findOneAndUpdate(
      { ProfessionalService_id: parseInt(ProfessionalService_id) },
      updateData,
      { new: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Professional service not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Service update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating professional service',
      error: error.message
    });
  }
});

// Mark service as complete
router.post('/services/:ProfessionalService_id/complete', auth, async (req, res) => {
  try {
    const { ProfessionalService_id } = req.params;
    const { completion_notes } = req.body;

    if (!ProfessionalService_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing professional service ID'
      });
    }

    const service = await ProfessionalService.findOne({ 
      ProfessionalService_id: parseInt(ProfessionalService_id) 
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Professional service not found'
      });
    }

    // Update service to completed status
    const updatedService = await ProfessionalService.findOneAndUpdate(
      { ProfessionalService_id: parseInt(ProfessionalService_id) },
      {
        service_status: 'Completed',
        payment_status: 'Completed',
        completion_date: new Date(),
        notes: completion_notes || service.notes,
        UpdatedBy: req.user.user_id,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Professional service marked as complete',
      data: updatedService
    });
  } catch (error) {
    console.error('Service completion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error completing professional service',
      error: error.message
    });
  }
});

// Record partial payment for service
router.post('/services/:ProfessionalService_id/partial-payment', auth, async (req, res) => {
  try {
    const { ProfessionalService_id } = req.params;
    const { partial_amount, payment_notes } = req.body;

    if (!ProfessionalService_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing professional service ID'
      });
    }

    if (!partial_amount || partial_amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid partial payment amount is required'
      });
    }

    const service = await ProfessionalService.findOne({ 
      ProfessionalService_id: parseInt(ProfessionalService_id) 
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Professional service not found'
      });
    }

    if (partial_amount > service.final_amount) {
      return res.status(400).json({
        success: false,
        message: 'Partial payment amount cannot exceed total service amount'
      });
    }

    // Update service payment status to partial
    const updatedService = await ProfessionalService.findOneAndUpdate(
      { ProfessionalService_id: parseInt(ProfessionalService_id) },
      {
        payment_status: 'Partial',
        notes: payment_notes ? `${service.notes}\nPartial Payment: ${partial_amount} - ${payment_notes}` : service.notes,
        UpdatedBy: req.user.user_id,
        UpdatedAt: new Date()
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Partial payment recorded successfully',
      data: {
        service: updatedService,
        payment_info: {
          partial_amount_paid: partial_amount,
          remaining_amount: service.final_amount - partial_amount,
          total_amount: service.final_amount
        }
      }
    });
  } catch (error) {
    console.error('Partial payment error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error recording partial payment',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * 5. CUSTOMER TRANSACTION ENDPOINTS
 * ============================================================================
 */

// Record customer transaction
router.post('/transactions/record', auth, async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      customer_id,
      transaction_amount,
      payment_method_used,
      payment_provider,
      merchant_reference,
      provider_reference,
      currency = 'XOF'
    } = req.body;

    // Validation
    if (!merchant_id || !customer_id || !transaction_amount || !payment_method_used) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const transaction = new CustomerTransaction({
      merchant_id,
      order_id,
      customer_id,
      transaction_amount,
      payment_method_used,
      payment_provider,
      merchant_reference,
      provider_reference,
      currency,
      transaction_status: 'Pending',
      settlement_status: 'Not_Settled',
      CreateBy: req.user.user_id,
      Status: true
    });

    await transaction.save();

    return res.status(201).json({
      success: true,
      message: 'Customer transaction recorded successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Transaction recording error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error recording transaction',
      error: error.message
    });
  }
});

// Get transactions for merchant
router.get('/transactions/merchant/:merchant_id', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const transactions = await CustomerTransaction.find({ merchant_id: req.params.merchant_id, Status: true })
      .skip(skip)
      .limit(limit)
      .sort({ transaction_date: -1 });

    const total = await CustomerTransaction.countDocuments({ merchant_id: req.params.merchant_id, Status: true });

    return res.status(200).json({
      success: true,
      message: 'Merchant transactions retrieved successfully',
      data: transactions,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch transactions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
});

// Get specific customer transaction
router.get('/transactions/:CustomerTransaction_id', auth, async (req, res) => {
  try {
    const { CustomerTransaction_id } = req.params;

    if (!CustomerTransaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    const transaction = await CustomerTransaction.findOne({ CustomerTransaction_id: parseInt(CustomerTransaction_id) });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction retrieved successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Fetch transaction error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching transaction',
      error: error.message
    });
  }
});

// Update customer transaction
router.put('/transactions/:CustomerTransaction_id', auth, async (req, res) => {
  try {
    const { CustomerTransaction_id } = req.params;
    const { transaction_status, settlement_status } = req.body;

    if (!CustomerTransaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    let updateData = {
      UpdatedBy: req.user.user_id,
      UpdatedAt: new Date()
    };

    if (transaction_status) updateData.transaction_status = transaction_status;
    if (settlement_status) updateData.settlement_status = settlement_status;

    const transaction = await CustomerTransaction.findOneAndUpdate(
      { CustomerTransaction_id: parseInt(CustomerTransaction_id) },
      updateData,
      { new: true }
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Transaction update error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating transaction',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * 6. REVENUE SUMMARY ENDPOINTS
 * ============================================================================
 */

// Generate revenue summary
router.post('/revenue-summary/generate', auth, async (req, res) => {
  try {
    const {
      summary_period = 'Monthly',
      period_start_date,
      period_end_date
    } = req.body;

    // Query aggregations
    const hardwareSalesData = await HardwareSale.aggregate([
      {
        $match: {
          CreateAt: {
            $gte: new Date(period_start_date),
            $lte: new Date(period_end_date)
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$final_amount' }
        }
      }
    ]);

    const subscriptionData = await SoftwareSubscription.aggregate([
      {
        $match: {
          subscription_status: 'Active',
          CreateAt: {
            $gte: new Date(period_start_date),
            $lte: new Date(period_end_date)
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$final_billing_amount' }
        }
      }
    ]);

    const addonData = await AddOnModule.aggregate([
      {
        $match: {
          addon_status: 'Active',
          CreateAt: {
            $gte: new Date(period_start_date),
            $lte: new Date(period_end_date)
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$final_billing_amount' }
        }
      }
    ]);

    const serviceData = await ProfessionalService.aggregate([
      {
        $match: {
          service_status: 'Completed',
          CreateAt: {
            $gte: new Date(period_start_date),
            $lte: new Date(period_end_date)
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          revenue: { $sum: '$final_amount' }
        }
      }
    ]);

    const hardware_sales_count = hardwareSalesData[0]?.count || 0;
    const hardware_sales_revenue = hardwareSalesData[0]?.revenue || 0;
    const active_subscriptions = subscriptionData[0]?.count || 0;
    const subscription_revenue = subscriptionData[0]?.revenue || 0;
    const addon_modules_active = addonData[0]?.count || 0;
    const addon_modules_revenue = addonData[0]?.revenue || 0;
    const professional_services_count = serviceData[0]?.count || 0;
    const professional_services_revenue = serviceData[0]?.revenue || 0;

    const total_revenue = hardware_sales_revenue + subscription_revenue + addon_modules_revenue + professional_services_revenue;

    const summary = new RevenueSummary({
      summary_period,
      period_start_date: new Date(period_start_date),
      period_end_date: new Date(period_end_date),
      hardware_sales_count,
      hardware_sales_revenue,
      active_subscriptions,
      subscription_revenue,
      addon_modules_active,
      addon_modules_revenue,
      professional_services_count,
      professional_services_revenue,
      total_revenue,
      CreateBy: req.user.user_id,
      Status: true
    });

    await summary.save();

    return res.status(201).json({
      success: true,
      message: 'Revenue summary generated successfully',
      data: summary
    });
  } catch (error) {
    console.error('Revenue summary generation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error generating revenue summary',
      error: error.message
    });
  }
});

// Get revenue summary
router.get('/revenue-summary', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const summaries = await RevenueSummary.find({ Status: true })
      .skip(skip)
      .limit(limit)
      .sort({ CreateAt: -1 });

    const total = await RevenueSummary.countDocuments({ Status: true });

    return res.status(200).json({
      success: true,
      message: 'Revenue summaries retrieved successfully',
      data: summaries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Fetch revenue summaries error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching revenue summaries',
      error: error.message
    });
  }
});

// Get specific revenue summary
router.get('/revenue-summary/:RevenueSummary_id', auth, async (req, res) => {
  try {
    const { RevenueSummary_id } = req.params;

    if (!RevenueSummary_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing revenue summary ID'
      });
    }

    const summary = await RevenueSummary.findOne({ RevenueSummary_id: parseInt(RevenueSummary_id) });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Revenue summary not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Revenue summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    console.error('Fetch revenue summary error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching revenue summary',
      error: error.message
    });
  }
});

/**
 * ============================================================================
 * DELETE ENDPOINTS
 * ============================================================================
 */

// Delete hardware sale
router.delete('/hardware-sales/:HardwareSale_id', auth, async (req, res) => {
  try {
    const { HardwareSale_id } = req.params;

    if (!HardwareSale_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing hardware sale ID'
      });
    }

    const hardwareSale = await HardwareSale.findOneAndDelete({ HardwareSale_id: parseInt(HardwareSale_id) });

    if (!hardwareSale) {
      return res.status(404).json({
        success: false,
        message: 'Hardware sale not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Hardware sale deleted successfully',
      data: hardwareSale
    });
  } catch (error) {
    console.error('Hardware sale deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting hardware sale',
      error: error.message
    });
  }
});

// Delete software subscription
router.delete('/subscriptions/:SoftwareSubscription_id', auth, async (req, res) => {
  try {
    const { SoftwareSubscription_id } = req.params;

    if (!SoftwareSubscription_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing subscription ID'
      });
    }

    const subscription = await SoftwareSubscription.findOneAndDelete({ SoftwareSubscription_id: parseInt(SoftwareSubscription_id) });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Subscription deleted successfully',
      data: subscription
    });
  } catch (error) {
    console.error('Subscription deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting subscription',
      error: error.message
    });
  }
});

// Delete add-on module
router.delete('/addons/:AddOnModule_id', auth, async (req, res) => {
  try {
    const { AddOnModule_id } = req.params;

    if (!AddOnModule_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing add-on module ID'
      });
    }

    const addon = await AddOnModule.findOneAndDelete({ AddOnModule_id: parseInt(AddOnModule_id) });

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: 'Add-on module not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Add-on module deleted successfully',
      data: addon
    });
  } catch (error) {
    console.error('Add-on module deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting add-on module',
      error: error.message
    });
  }
});

// Delete professional service
router.delete('/services/:ProfessionalService_id', auth, async (req, res) => {
  try {
    const { ProfessionalService_id } = req.params;

    if (!ProfessionalService_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing professional service ID'
      });
    }

    const service = await ProfessionalService.findOneAndDelete({ ProfessionalService_id: parseInt(ProfessionalService_id) });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Professional service not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Professional service deleted successfully',
      data: service
    });
  } catch (error) {
    console.error('Professional service deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting professional service',
      error: error.message
    });
  }
});

// Delete customer transaction
router.delete('/transactions/:CustomerTransaction_id', auth, async (req, res) => {
  try {
    const { CustomerTransaction_id } = req.params;

    if (!CustomerTransaction_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing transaction ID'
      });
    }

    const transaction = await CustomerTransaction.findOneAndDelete({ CustomerTransaction_id: parseInt(CustomerTransaction_id) });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      data: transaction
    });
  } catch (error) {
    console.error('Transaction deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting transaction',
      error: error.message
    });
  }
});

// Delete revenue summary
router.delete('/revenue-summary/:RevenueSummary_id', auth, async (req, res) => {
  try {
    const { RevenueSummary_id } = req.params;

    if (!RevenueSummary_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing revenue summary ID'
      });
    }

    const summary = await RevenueSummary.findOneAndDelete({ RevenueSummary_id: parseInt(RevenueSummary_id) });

    if (!summary) {
      return res.status(404).json({
        success: false,
        message: 'Revenue summary not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Revenue summary deleted successfully',
      data: summary
    });
  } catch (error) {
    console.error('Revenue summary deletion error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting revenue summary',
      error: error.message
    });
  }
});

module.exports = router;
