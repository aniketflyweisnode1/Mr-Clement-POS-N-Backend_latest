const Plan_map_Client = require('../models/Plan_map_Client.model');
const User = require('../models/User.model');
const Clients = require('../models/Clients.model');
const Plan = require('../models/Plan.model');
const Transaction = require('../models/Transaction.model');
const payment_type = require('../models/payment_type.model');
const Payments = require('../models/Payments.model');
const Payment_Options = require('../models/Payment_Options.model');

// Helper function to calculate expiry date from plan_duration string
const calculateExpiryDate = (planDuration) => {
  if (!planDuration) return null;
  
  const durationStr = planDuration.toLowerCase().trim();
  const match = durationStr.match(/(\d+)\s*(day|days|month|months|year|years)/);
  
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  const expiryDate = new Date();
  
  if (unit.includes('day')) {
    expiryDate.setDate(expiryDate.getDate() + value);
  } else if (unit.includes('month')) {
    expiryDate.setMonth(expiryDate.getMonth() + value);
  } else if (unit.includes('year')) {
    expiryDate.setFullYear(expiryDate.getFullYear() + value);
  }
  
  return expiryDate;
};

// Create Plan Map Client
const createPlanMapClient = async (req, res) => {
  try {
    const {
      client_id,
      plan_id,
      PaymentType_id,
      Payment,
      Payment_Options_id,
      PaymentStatus,
      amount,
      Status
    } = req.body;

    const userId = req.user?.user_id || null;

    // Validate client and plan exist
    const [client, plan] = await Promise.all([
      Clients.findOne({ Clients_id: parseInt(client_id) }),
      Plan.findOne({ Plan_id: parseInt(plan_id) })
    ]);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Validate payment-related fields if provided
    let transactionId = null;
    let calculatedExpiryDate = null;
    let finalPaymentStatus = PaymentStatus || 'Pending';

    // If payment fields are provided, create transaction and calculate expiry
    if (PaymentType_id || Payment || Payment_Options_id || amount) {
      // Validate PaymentType_id if provided
      if (PaymentType_id) {
        const paymentType = await payment_type.findOne({ payment_type_id: parseInt(PaymentType_id) });
        if (!paymentType) {
          return res.status(404).json({
            success: false,
            message: 'Payment type not found'
          });
        }
      }

      // Validate Payment if provided
      if (Payment) {
        const payment = await Payments.findOne({ Payment_id: parseInt(Payment) });
        if (!payment) {
          return res.status(404).json({
            success: false,
            message: 'Payment not found'
          });
        }
      }

      // Validate Payment_Options_id if provided
      if (Payment_Options_id) {
        const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(Payment_Options_id) });
        if (!paymentOption) {
          return res.status(404).json({
            success: false,
            message: 'Payment option not found'
          });
        }
      }

      // Auto-create Transaction if amount is provided
      if (amount !== undefined && amount !== null) {
        // Get payment method from Payment_Options if provided
        let paymentMethod = 'Cash'; // Default
        if (Payment_Options_id) {
          const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(Payment_Options_id) });
          if (paymentOption && paymentOption.PaymentOption && paymentOption.PaymentOption.length > 0) {
            paymentMethod = paymentOption.PaymentOption[0].option || 'Cash';
          }
        }

        // Determine transaction status based on PaymentStatus
        let transactionStatus = 'Pending';
        if (finalPaymentStatus === 'Success') {
          transactionStatus = 'success';
        } else if (finalPaymentStatus === 'Failed') {
          transactionStatus = 'failed';
        }

        // Create Transaction
        const transaction = new Transaction({
          user_id: userId,
          amount: parseFloat(amount),
          status: transactionStatus,
          payment_method: paymentMethod,
          transactionType: 'Plan_Buy',
          transaction_date: new Date(),
          reference_number: `PLAN-${plan_id}-CLIENT-${client_id}`,
          created_by: userId,
          created_at: new Date()
        });

        const savedTransaction = await transaction.save();
        transactionId = savedTransaction.transagtion_id;

        // If payment is successful, calculate expiry date
        if (finalPaymentStatus === 'Success' && plan.plan_duration) {
          calculatedExpiryDate = calculateExpiryDate(plan.plan_duration);
        }
      }
    }

    const planMapClient = new Plan_map_Client({
      client_id: parseInt(client_id),
      plan_id: parseInt(plan_id),
      Transaction_id: transactionId,
      PaymentType_id: PaymentType_id ? parseInt(PaymentType_id) : null,
      Payment: Payment ? parseInt(Payment) : null,
      Payment_Options_id: Payment_Options_id ? parseInt(Payment_Options_id) : null,
      PlanExpiryDate: calculatedExpiryDate,
      PaymentStatus: finalPaymentStatus,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedPlanMapClient = await planMapClient.save();
    
    // Manually fetch related data
    const [createByUser, clientData, planData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
      savedPlanMapClient.CreateBy ? User.findOne({ user_id: savedPlanMapClient.CreateBy }) : null,
      Clients.findOne({ Clients_id: savedPlanMapClient.client_id }),
      Plan.findOne({ Plan_id: savedPlanMapClient.plan_id }),
      savedPlanMapClient.Transaction_id ? Transaction.findOne({ transagtion_id: savedPlanMapClient.Transaction_id }) : null,
      savedPlanMapClient.PaymentType_id ? payment_type.findOne({ payment_type_id: savedPlanMapClient.PaymentType_id }) : null,
      savedPlanMapClient.Payment ? Payments.findOne({ Payment_id: savedPlanMapClient.Payment }) : null,
      savedPlanMapClient.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: savedPlanMapClient.Payment_Options_id }) : null
    ]);

    // Create response object with populated data
    const planMapClientResponse = savedPlanMapClient.toObject();
    planMapClientResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    planMapClientResponse.client_id = clientData ? 
      { Clients_id: clientData.Clients_id, Business_Name: clientData.Business_Name, Email: clientData.Email } : null;
    planMapClientResponse.plan_id = planData ? 
      { Plan_id: planData.Plan_id, name: planData.name, plan_duration: planData.plan_duration } : null;
    planMapClientResponse.Transaction_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method
    } : null;
    planMapClientResponse.PaymentType_id = paymentTypeData ? {
      payment_type_id: paymentTypeData.payment_type_id,
      Name: paymentTypeData.Name
    } : null;
    planMapClientResponse.Payment = paymentData ? {
      Payment_id: paymentData.Payment_id,
      name: paymentData.name
    } : null;
    planMapClientResponse.Payment_Options_id = paymentOptionData ? {
      Payment_Options_id: paymentOptionData.Payment_Options_id,
      PaymentOption: paymentOptionData.PaymentOption
    } : null;
    
    res.status(201).json({
      success: true,
      message: 'Plan map client created successfully',
      data: planMapClientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating plan map client',
      error: error.message
    });
  }
};

// Update Plan Map Client
const updatePlanMapClient = async (req, res) => {
  try {
    const { id, PaymentType_id, Payment, Payment_Options_id, PaymentStatus, amount, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Plan Map Client ID is required in request body'
      });
    }

    const planMapClient = await Plan_map_Client.findOne({ Plan_map_Client_id: parseInt(id) });
    if (!planMapClient) {
      return res.status(404).json({
        success: false,
        message: 'Plan map client not found'
      });
    }

    // Get plan to calculate expiry date
    const plan = await Plan.findOne({ Plan_id: planMapClient.plan_id });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Handle payment-related updates
    let transactionId = planMapClient.Transaction_id;
    let calculatedExpiryDate = planMapClient.PlanExpiryDate;
    let finalPaymentStatus = PaymentStatus !== undefined ? PaymentStatus : planMapClient.PaymentStatus;

    // Validate payment-related fields if provided
    if (PaymentType_id !== undefined) {
      const paymentType = await payment_type.findOne({ payment_type_id: parseInt(PaymentType_id) });
      if (!paymentType) {
        return res.status(404).json({
          success: false,
          message: 'Payment type not found'
        });
      }
      planMapClient.PaymentType_id = parseInt(PaymentType_id);
    }

    if (Payment !== undefined) {
      if (Payment !== null) {
        const payment = await Payments.findOne({ Payment_id: parseInt(Payment) });
        if (!payment) {
          return res.status(404).json({
            success: false,
            message: 'Payment not found'
          });
        }
        planMapClient.Payment = parseInt(Payment);
      } else {
        planMapClient.Payment = null;
      }
    }

    if (Payment_Options_id !== undefined) {
      if (Payment_Options_id !== null) {
        const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(Payment_Options_id) });
        if (!paymentOption) {
          return res.status(404).json({
            success: false,
            message: 'Payment option not found'
          });
        }
        planMapClient.Payment_Options_id = parseInt(Payment_Options_id);
      } else {
        planMapClient.Payment_Options_id = null;
      }
    }

    // If payment status is being updated or amount is provided, handle transaction
    if (PaymentStatus !== undefined || amount !== undefined) {
      // Auto-create Transaction if amount is provided and no transaction exists
      if (amount !== undefined && amount !== null && !transactionId) {
        // Get payment method from Payment_Options if provided
        let paymentMethod = 'Cash'; // Default
        if (planMapClient.Payment_Options_id) {
          const paymentOption = await Payment_Options.findOne({ Payment_Options_id: planMapClient.Payment_Options_id });
          if (paymentOption && paymentOption.PaymentOption && paymentOption.PaymentOption.length > 0) {
            paymentMethod = paymentOption.PaymentOption[0].option || 'Cash';
          }
        }

        // Determine transaction status based on PaymentStatus
        let transactionStatus = 'Pending';
        if (finalPaymentStatus === 'Success') {
          transactionStatus = 'success';
        } else if (finalPaymentStatus === 'Failed') {
          transactionStatus = 'failed';
        }

        // Create Transaction
        const transaction = new Transaction({
          user_id: userId,
          amount: parseFloat(amount),
          status: transactionStatus,
          payment_method: paymentMethod,
          transactionType: 'Plan_Buy',
          transaction_date: new Date(),
          reference_number: `PLAN-${planMapClient.plan_id}-CLIENT-${planMapClient.client_id}`,
          created_by: userId,
          created_at: new Date()
        });

        const savedTransaction = await transaction.save();
        transactionId = savedTransaction.transagtion_id;
        planMapClient.Transaction_id = transactionId;
      }

      // Update PaymentStatus
      planMapClient.PaymentStatus = finalPaymentStatus;

      // If payment is successful, calculate and update expiry date
      if (finalPaymentStatus === 'Success' && plan.plan_duration) {
        calculatedExpiryDate = calculateExpiryDate(plan.plan_duration);
        planMapClient.PlanExpiryDate = calculatedExpiryDate;
      }
    }

    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Plan_map_Client_id' && key !== 'Transaction_id' && key !== 'PlanExpiryDate' && key !== 'PaymentStatus') {
        planMapClient[key] = updateData[key];
      }
    });

    planMapClient.UpdatedBy = userId;
    planMapClient.UpdatedAt = new Date();

    const updatedPlanMapClient = await planMapClient.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser, client, planData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
      updatedPlanMapClient.CreateBy ? User.findOne({ user_id: updatedPlanMapClient.CreateBy }) : null,
      updatedPlanMapClient.UpdatedBy ? User.findOne({ user_id: updatedPlanMapClient.UpdatedBy }) : null,
      updatedPlanMapClient.client_id ? Clients.findOne({ Clients_id: updatedPlanMapClient.client_id }) : null,
      Plan.findOne({ Plan_id: updatedPlanMapClient.plan_id }),
      updatedPlanMapClient.Transaction_id ? Transaction.findOne({ transagtion_id: updatedPlanMapClient.Transaction_id }) : null,
      updatedPlanMapClient.PaymentType_id ? payment_type.findOne({ payment_type_id: updatedPlanMapClient.PaymentType_id }) : null,
      updatedPlanMapClient.Payment ? Payments.findOne({ Payment_id: updatedPlanMapClient.Payment }) : null,
      updatedPlanMapClient.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: updatedPlanMapClient.Payment_Options_id }) : null
    ]);

    // Create response object with populated data
    const planMapClientResponse = updatedPlanMapClient.toObject();
    planMapClientResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    planMapClientResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    planMapClientResponse.client_id = client ? 
      { Clients_id: client.Clients_id, Business_Name: client.Business_Name, Email: client.Email } : null;
    planMapClientResponse.plan_id = planData ? 
      { Plan_id: planData.Plan_id, name: planData.name, plan_duration: planData.plan_duration } : null;
    planMapClientResponse.Transaction_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method
    } : null;
    planMapClientResponse.PaymentType_id = paymentTypeData ? {
      payment_type_id: paymentTypeData.payment_type_id,
      Name: paymentTypeData.Name
    } : null;
    planMapClientResponse.Payment = paymentData ? {
      Payment_id: paymentData.Payment_id,
      name: paymentData.name
    } : null;
    planMapClientResponse.Payment_Options_id = paymentOptionData ? {
      Payment_Options_id: paymentOptionData.Payment_Options_id,
      PaymentOption: paymentOptionData.PaymentOption
    } : null;
    
    res.status(200).json({
      success: true,
      message: 'Plan map client updated successfully',
      data: planMapClientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating plan map client',
      error: error.message
    });
  }
};

// Get Plan Map Client by ID
const getPlanMapClientById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const planMapClient = await Plan_map_Client.findOne({ Plan_map_Client_id: parseInt(id) });
    
    if (!planMapClient) {
      return res.status(404).json({
        success: false,
        message: 'Plan map client not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, client, plan, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
      planMapClient.CreateBy ? User.findOne({ user_id: planMapClient.CreateBy }) : null,
      planMapClient.UpdatedBy ? User.findOne({ user_id: planMapClient.UpdatedBy }) : null,
      planMapClient.client_id ? Clients.findOne({ Clients_id: planMapClient.client_id }) : null,
      planMapClient.plan_id ? Plan.findOne({ Plan_id: planMapClient.plan_id }) : null,
      planMapClient.Transaction_id ? Transaction.findOne({ transagtion_id: planMapClient.Transaction_id }) : null,
      planMapClient.PaymentType_id ? payment_type.findOne({ payment_type_id: planMapClient.PaymentType_id }) : null,
      planMapClient.Payment ? Payments.findOne({ Payment_id: planMapClient.Payment }) : null,
      planMapClient.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: planMapClient.Payment_Options_id }) : null
    ]);

    // Create response object with populated data
    const planMapClientResponse = planMapClient.toObject();
    planMapClientResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    planMapClientResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    planMapClientResponse.client_id = client ? 
      { Clients_id: client.Clients_id, Business_Name: client.Business_Name, Email: client.Email } : null;
    planMapClientResponse.plan_id = plan ? 
      { Plan_id: plan.Plan_id, name: plan.name, plan_duration: plan.plan_duration } : null;
    planMapClientResponse.Transaction_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method
    } : null;
    planMapClientResponse.PaymentType_id = paymentTypeData ? {
      payment_type_id: paymentTypeData.payment_type_id,
      Name: paymentTypeData.Name
    } : null;
    planMapClientResponse.Payment = paymentData ? {
      Payment_id: paymentData.Payment_id,
      name: paymentData.name
    } : null;
    planMapClientResponse.Payment_Options_id = paymentOptionData ? {
      Payment_Options_id: paymentOptionData.Payment_Options_id,
      PaymentOption: paymentOptionData.PaymentOption
    } : null;

    res.status(200).json({
      success: true,
      data: planMapClientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plan map client',
      error: error.message
    });
  }
};

// Get All Plan Map Clients
const getAllPlanMapClients = async (req, res) => {
  try {
    const planMapClients = await Plan_map_Client.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all plan map clients
    const planMapClientsResponse = await Promise.all(planMapClients.map(async (planMapClient) => {
      const [createByUser, updatedByUser, client, plan, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
        planMapClient.CreateBy ? User.findOne({ user_id: planMapClient.CreateBy }) : null,
        planMapClient.UpdatedBy ? User.findOne({ user_id: planMapClient.UpdatedBy }) : null,
        planMapClient.client_id ? Clients.findOne({ Clients_id: planMapClient.client_id }) : null,
        planMapClient.plan_id ? Plan.findOne({ Plan_id: planMapClient.plan_id }) : null,
        planMapClient.Transaction_id ? Transaction.findOne({ transagtion_id: planMapClient.Transaction_id }) : null,
        planMapClient.PaymentType_id ? payment_type.findOne({ payment_type_id: planMapClient.PaymentType_id }) : null,
        planMapClient.Payment ? Payments.findOne({ Payment_id: planMapClient.Payment }) : null,
        planMapClient.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: planMapClient.Payment_Options_id }) : null
      ]);

      const planMapClientObj = planMapClient.toObject();
      planMapClientObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      planMapClientObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
      planMapClientObj.client_id = client ? 
        { Clients_id: client.Clients_id, Business_Name: client.Business_Name, Email: client.Email } : null;
      planMapClientObj.plan_id = plan ? 
        { Plan_id: plan.Plan_id, name: plan.name, plan_duration: plan.plan_duration } : null;
      planMapClientObj.Transaction_id = transactionData ? {
        transagtion_id: transactionData.transagtion_id,
        amount: transactionData.amount,
        status: transactionData.status,
        payment_method: transactionData.payment_method
      } : null;
      planMapClientObj.PaymentType_id = paymentTypeData ? {
        payment_type_id: paymentTypeData.payment_type_id,
        Name: paymentTypeData.Name
      } : null;
      planMapClientObj.Payment = paymentData ? {
        Payment_id: paymentData.Payment_id,
        name: paymentData.name
      } : null;
      planMapClientObj.Payment_Options_id = paymentOptionData ? {
        Payment_Options_id: paymentOptionData.Payment_Options_id,
        PaymentOption: paymentOptionData.PaymentOption
      } : null;

      return planMapClientObj;
    }));

    res.status(200).json({
      success: true,
      count: planMapClientsResponse.length,
      data: planMapClientsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plan map clients',
      error: error.message
    });
  }
};

// Get Plan Map Client by Auth (current logged in user)
const getPlanMapClientByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const planMapClients = await Plan_map_Client.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!planMapClients || planMapClients.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan map clients not found for current user'
      });
    }

    // Manually fetch related data for all plan map clients
    const planMapClientsResponse = await Promise.all(planMapClients.map(async (planMapClient) => {
      const [createByUser, updatedByUser, client, plan, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
        planMapClient.CreateBy ? User.findOne({ user_id: planMapClient.CreateBy }) : null,
        planMapClient.UpdatedBy ? User.findOne({ user_id: planMapClient.UpdatedBy }) : null,
        planMapClient.client_id ? Clients.findOne({ Clients_id: planMapClient.client_id }) : null,
        planMapClient.plan_id ? Plan.findOne({ Plan_id: planMapClient.plan_id }) : null,
        planMapClient.Transaction_id ? Transaction.findOne({ transagtion_id: planMapClient.Transaction_id }) : null,
        planMapClient.PaymentType_id ? payment_type.findOne({ payment_type_id: planMapClient.PaymentType_id }) : null,
        planMapClient.Payment ? Payments.findOne({ Payment_id: planMapClient.Payment }) : null,
        planMapClient.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: planMapClient.Payment_Options_id }) : null
      ]);

      const planMapClientObj = planMapClient.toObject();
      planMapClientObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      planMapClientObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
      planMapClientObj.client_id = client ? 
        { Clients_id: client.Clients_id, Business_Name: client.Business_Name, Email: client.Email } : null;
      planMapClientObj.plan_id = plan ? 
        { Plan_id: plan.Plan_id, name: plan.name, plan_duration: plan.plan_duration } : null;
      planMapClientObj.Transaction_id = transactionData ? {
        transagtion_id: transactionData.transagtion_id,
        amount: transactionData.amount,
        status: transactionData.status,
        payment_method: transactionData.payment_method
      } : null;
      planMapClientObj.PaymentType_id = paymentTypeData ? {
        payment_type_id: paymentTypeData.payment_type_id,
        Name: paymentTypeData.Name
      } : null;
      planMapClientObj.Payment = paymentData ? {
        Payment_id: paymentData.Payment_id,
        name: paymentData.name
      } : null;
      planMapClientObj.Payment_Options_id = paymentOptionData ? {
        Payment_Options_id: paymentOptionData.Payment_Options_id,
        PaymentOption: paymentOptionData.PaymentOption
      } : null;

      return planMapClientObj;
    }));

    res.status(200).json({
      success: true,
      count: planMapClientsResponse.length,
      data: planMapClientsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching plan map clients',
      error: error.message
    });
  }
};

// Helper function to get date range based on filter
const getDateRangeForFilter = (filter) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  startOfDay.setHours(0, 0, 0, 0);
  
  switch (filter) {
    case 'today':
      return {
        start: startOfDay,
        end: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
      };
    case 'yesterday':
      const yesterdayStart = new Date(startOfDay);
      yesterdayStart.setDate(startOfDay.getDate() - 1);
      return {
        start: yesterdayStart,
        end: startOfDay
      };
    case 'this week':
    case 'thisWeek':
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - dayOfWeek);
      return {
        start: startOfWeek,
        end: new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000)
      };
    case 'this month':
    case 'thisMonth':
      return {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: new Date(now.getFullYear(), now.getMonth() + 1, 1)
      };
    case 'this year':
    case 'thisYear':
      return {
        start: new Date(now.getFullYear(), 0, 1),
        end: new Date(now.getFullYear() + 1, 0, 1)
      };
    default:
      return null; // No filter, return all
  }
};

// Get Subscriptions List with Date Filter
const getSubscriptionsList = async (req, res) => {
  try {
    const { filter } = req.query; // filter: today, yesterday, this week, this month, this year

    // Build base query
    let query = { Status: true };

    // Apply date filter if provided
    let dateRange = null;
    if (filter) {
      dateRange = getDateRangeForFilter(filter);
      if (dateRange) {
        // Filter by CreateAt (PlanSubscriptionsDate) - when subscription was purchased
        query.CreateAt = {
          $gte: dateRange.start,
          $lt: dateRange.end
        };
      }
    }

    // Get all plan map clients matching the filter
    const planMapClients = await Plan_map_Client.find(query).sort({ CreateAt: -1 });

    // Fetch related data for all subscriptions
    const subscriptionsList = await Promise.all(planMapClients.map(async (planMapClient) => {
      const [client, plan, transaction] = await Promise.all([
        planMapClient.client_id ? Clients.findOne({ Clients_id: planMapClient.client_id }) : null,
        planMapClient.plan_id ? Plan.findOne({ Plan_id: planMapClient.plan_id }) : null,
        planMapClient.Transaction_id ? Transaction.findOne({ transagtion_id: planMapClient.Transaction_id }) : null
      ]);

      return {
        Business_Name: client ? client.Business_Name : null,
        Plan_Purchased: plan ? plan.name : null,
        Renewal_Date: planMapClient.PlanExpiryDate || null,
        Transaction_Id: transaction ? transaction.transagtion_id : null,
        Plan_id: planMapClient.plan_id || null,
        Client_id: planMapClient.client_id || null,
        PlanSubscriptionsDate: planMapClient.CreateAt || null
      };
    }));

    res.status(200).json({
      success: true,
      count: subscriptionsList.length,
      filter: filter || 'all',
      data: subscriptionsList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions list',
      error: error.message
    });
  }
};

// Update Plan Planmap Client Message
const updatePlanPlanmapClientMessage = async (req, res) => {
  try {
    const { id, Two_Weeks_ago, one_Weeks_ago, One_Day_ago } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Plan Map Client ID is required'
      });
    }

    const planMapClient = await Plan_map_Client.findOne({ Plan_map_Client_id: parseInt(id) });
    if (!planMapClient) {
      return res.status(404).json({
        success: false,
        message: 'Plan map client not found'
      });
    }

    if (Two_Weeks_ago !== undefined) planMapClient.Two_Weeks_ago = Two_Weeks_ago;
    if (one_Weeks_ago !== undefined) planMapClient.one_Weeks_ago = one_Weeks_ago;
    if (One_Day_ago !== undefined) planMapClient.One_Day_ago = One_Day_ago;

    planMapClient.UpdatedBy = userId;
    planMapClient.UpdatedAt = new Date();

    const updated = await planMapClient.save();

    res.status(200).json({
      success: true,
      message: 'Plan map client message updated successfully',
      data: updated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating plan map client message',
      error: error.message
    });
  }
};

module.exports = {
  createPlanMapClient,
  updatePlanMapClient,
  getPlanMapClientById,
  getAllPlanMapClients,
  getPlanMapClientByAuth,
  getSubscriptionsList,
  updatePlanPlanmapClientMessage
};
