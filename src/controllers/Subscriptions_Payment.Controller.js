const Subscriptions_Payment = require('../models/Subscriptions_Payment.model');
const Plan_map_Client = require('../models/Plan_map_Client.model');
const Transaction = require('../models/Transaction.model');
const Payment_Options = require('../models/Payment_Options.model');
const payment_type = require('../models/payment_type.model');
const Payments = require('../models/Payments.model');
const User = require('../models/User.model');
const Clients = require('../models/Clients.model');
const Plan = require('../models/Plan.model');

// Create Subscriptions Payment
const createSubscriptionsPayment = async (req, res) => {
  try {
    const {
      Plan_map_Client_id,
      PaymentType_id,
      Payment,
      Payment_Options_id,
      PaymentStatus,
      referenceNumber,
      amount
    } = req.body;

    const userId = req.user.user_id;

    if (!Plan_map_Client_id) {
      return res.status(400).json({
        success: false,
        message: 'Plan_map_Client_id is required'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Validate Plan_map_Client exists
    const planMapClient = await Plan_map_Client.findOne({ Plan_map_Client_id: parseInt(Plan_map_Client_id) });
    if (!planMapClient) {
      return res.status(404).json({
        success: false,
        message: 'Plan map client (subscription) not found'
      });
    }

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
    let paymentMethod = 'Cash'; // Default
    if (Payment_Options_id) {
      const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(Payment_Options_id) });
      if (!paymentOption) {
        return res.status(404).json({
          success: false,
          message: 'Payment option not found'
        });
      }
      // Get payment method from Payment_Options
      if (paymentOption.PaymentOption && paymentOption.PaymentOption.length > 0) {
        paymentMethod = paymentOption.PaymentOption[0].option || 'Cash';
      }
    }

    // Validate PaymentStatus if provided
    const finalPaymentStatus = PaymentStatus || 'Pending';
    const validPaymentStatuses = ['Pending', 'Success', 'Failed', 'Cancelled'];
    if (!validPaymentStatuses.includes(finalPaymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid PaymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`
      });
    }

    // Determine transaction status based on PaymentStatus
    let transactionStatus = 'Pending';
    if (finalPaymentStatus === 'Success') {
      transactionStatus = 'success';
    } else if (finalPaymentStatus === 'Failed') {
      transactionStatus = 'failed';
    }

    // Automatically create Transaction
    const transaction = new Transaction({
      user_id: userId,
      amount: parseFloat(amount),
      status: transactionStatus,
      payment_method: paymentMethod,
      transactionType: 'Plan_Buy',
      transaction_date: new Date(),
      reference_number: referenceNumber,
      created_by: userId,
      created_at: new Date()
    });

    const savedTransaction = await transaction.save();

    // Create subscription payment
    const subscriptionPayment = new Subscriptions_Payment({
      Plan_map_Client_id: parseInt(Plan_map_Client_id),
      Transaction_id: savedTransaction.transagtion_id,
      PaymentType_id: PaymentType_id ? parseInt(PaymentType_id) : null,
      Payment: Payment ? parseInt(Payment) : null,
      Payment_Options_id: Payment_Options_id ? parseInt(Payment_Options_id) : null,
      PaymentStatus: finalPaymentStatus,
      amount: parseFloat(amount),
      Status: true,
      CreateBy: userId,
      CreateAt: new Date()
    });

    const savedPayment = await subscriptionPayment.save();

    // Update Plan_map_Client PaymentStatus and Transaction_id if payment is successful
    if (finalPaymentStatus === 'Success') {
      planMapClient.PaymentStatus = 'Success';
      planMapClient.Transaction_id = savedTransaction.transagtion_id;
      if (PaymentType_id) planMapClient.PaymentType_id = parseInt(PaymentType_id);
      if (Payment) planMapClient.Payment = parseInt(Payment);
      if (Payment_Options_id) planMapClient.Payment_Options_id = parseInt(Payment_Options_id);
      await planMapClient.save();
    }

    // Fetch related data for response
    const [createByUser, planMapClientData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
      User.findOne({ user_id: savedPayment.CreateBy }),
      Plan_map_Client.findOne({ Plan_map_Client_id: savedPayment.Plan_map_Client_id }),
      Transaction.findOne({ transagtion_id: savedPayment.Transaction_id }),
      savedPayment.PaymentType_id ? payment_type.findOne({ payment_type_id: savedPayment.PaymentType_id }) : null,
      savedPayment.Payment ? Payments.findOne({ Payment_id: savedPayment.Payment }) : null,
      savedPayment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: savedPayment.Payment_Options_id }) : null
    ]);

    // Populate Plan_map_Client data
    let planMapClientResponse = null;
    if (planMapClientData) {
      const [client, plan] = await Promise.all([
        Clients.findOne({ Clients_id: planMapClientData.client_id }),
        Plan.findOne({ Plan_id: planMapClientData.plan_id })
      ]);

      planMapClientResponse = {
        Plan_map_Client_id: planMapClientData.Plan_map_Client_id,
        client_id: client ? {
          Clients_id: client.Clients_id,
          Business_Name: client.Business_Name,
          Email: client.Email
        } : null,
        plan_id: plan ? {
          Plan_id: plan.Plan_id,
          name: plan.name,
          plan_duration: plan.plan_duration
        } : null,
        PaymentStatus: planMapClientData.PaymentStatus,
        PlanExpiryDate: planMapClientData.PlanExpiryDate
      };
    }

    // Create response object with populated data
    const paymentResponse = savedPayment.toObject();
    paymentResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    paymentResponse.Plan_map_Client_id = planMapClientResponse;
    paymentResponse.Transaction_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method,
      transactionType: transactionData.transactionType,
      reference_number: transactionData.reference_number
    } : null;
    paymentResponse.PaymentType_id = paymentTypeData ? {
      payment_type_id: paymentTypeData.payment_type_id,
      Name: paymentTypeData.Name
    } : null;
    paymentResponse.Payment = paymentData ? {
      Payment_id: paymentData.Payment_id,
      name: paymentData.name
    } : null;
    paymentResponse.Payment_Options_id = paymentOptionData ? {
      Payment_Options_id: paymentOptionData.Payment_Options_id,
      PaymentOption: paymentOptionData.PaymentOption
    } : null;

    res.status(201).json({
      success: true,
      message: 'Subscription payment created successfully',
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating subscription payment',
      error: error.message
    });
  }
};

// Update Subscriptions Payment
const updateSubscriptionsPayment = async (req, res) => {
  try {
    const { id, PaymentType_id, Payment, Payment_Options_id, PaymentStatus, amount, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Subscriptions_Payment_id is required in request body'
      });
    }

    const subscriptionPayment = await Subscriptions_Payment.findOne({ Subscriptions_Payment_id: parseInt(id) });
    if (!subscriptionPayment) {
      return res.status(404).json({
        success: false,
        message: 'Subscription payment not found'
      });
    }

    // Validate PaymentType_id if provided
    if (PaymentType_id !== undefined) {
      if (PaymentType_id !== null) {
        const paymentType = await payment_type.findOne({ payment_type_id: parseInt(PaymentType_id) });
        if (!paymentType) {
          return res.status(404).json({
            success: false,
            message: 'Payment type not found'
          });
        }
        subscriptionPayment.PaymentType_id = parseInt(PaymentType_id);
      } else {
        subscriptionPayment.PaymentType_id = null;
      }
    }

    // Validate Payment if provided
    if (Payment !== undefined) {
      if (Payment !== null) {
        const payment = await Payments.findOne({ Payment_id: parseInt(Payment) });
        if (!payment) {
          return res.status(404).json({
            success: false,
            message: 'Payment not found'
          });
        }
        subscriptionPayment.Payment = parseInt(Payment);
      } else {
        subscriptionPayment.Payment = null;
      }
    }

    // Validate Payment_Options_id if provided
    if (Payment_Options_id !== undefined) {
      if (Payment_Options_id !== null) {
        const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(Payment_Options_id) });
        if (!paymentOption) {
          return res.status(404).json({
            success: false,
            message: 'Payment option not found'
          });
        }
        subscriptionPayment.Payment_Options_id = parseInt(Payment_Options_id);
      } else {
        subscriptionPayment.Payment_Options_id = null;
      }
    }

    // Validate PaymentStatus if provided
    if (PaymentStatus !== undefined) {
      const validPaymentStatuses = ['Pending', 'Success', 'Failed', 'Cancelled'];
      if (!validPaymentStatuses.includes(PaymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid PaymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
      subscriptionPayment.PaymentStatus = PaymentStatus;
    }

    // Update amount if provided
    if (amount !== undefined && amount !== null) {
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than 0'
        });
      }
      subscriptionPayment.amount = parseFloat(amount);

      // Update transaction amount if transaction exists
      if (subscriptionPayment.Transaction_id) {
        const transaction = await Transaction.findOne({ transagtion_id: subscriptionPayment.Transaction_id });
        if (transaction) {
          transaction.amount = parseFloat(amount);
          await transaction.save();
        }
      }
    }

    // Update other fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Subscriptions_Payment_id' && key !== 'Transaction_id') {
        subscriptionPayment[key] = updateData[key];
      }
    });

    subscriptionPayment.UpdatedBy = userId;
    subscriptionPayment.UpdatedAt = new Date();

    const updatedPayment = await subscriptionPayment.save();

    // Update Plan_map_Client PaymentStatus if payment status changed to Success
    if (PaymentStatus === 'Success') {
      const planMapClient = await Plan_map_Client.findOne({ Plan_map_Client_id: updatedPayment.Plan_map_Client_id });
      if (planMapClient) {
        planMapClient.PaymentStatus = 'Success';
        if (updatedPayment.Transaction_id) planMapClient.Transaction_id = updatedPayment.Transaction_id;
        if (updatedPayment.PaymentType_id) planMapClient.PaymentType_id = updatedPayment.PaymentType_id;
        if (updatedPayment.Payment) planMapClient.Payment = updatedPayment.Payment;
        if (updatedPayment.Payment_Options_id) planMapClient.Payment_Options_id = updatedPayment.Payment_Options_id;
        await planMapClient.save();
      }
    }

    // Fetch related data for response
    const [createByUser, updatedByUser, planMapClientData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
      updatedPayment.CreateBy ? User.findOne({ user_id: updatedPayment.CreateBy }) : null,
      updatedPayment.UpdatedBy ? User.findOne({ user_id: updatedPayment.UpdatedBy }) : null,
      Plan_map_Client.findOne({ Plan_map_Client_id: updatedPayment.Plan_map_Client_id }),
      updatedPayment.Transaction_id ? Transaction.findOne({ transagtion_id: updatedPayment.Transaction_id }) : null,
      updatedPayment.PaymentType_id ? payment_type.findOne({ payment_type_id: updatedPayment.PaymentType_id }) : null,
      updatedPayment.Payment ? Payments.findOne({ Payment_id: updatedPayment.Payment }) : null,
      updatedPayment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: updatedPayment.Payment_Options_id }) : null
    ]);

    // Populate Plan_map_Client data
    let planMapClientResponse = null;
    if (planMapClientData) {
      const [client, plan] = await Promise.all([
        Clients.findOne({ Clients_id: planMapClientData.client_id }),
        Plan.findOne({ Plan_id: planMapClientData.plan_id })
      ]);

      planMapClientResponse = {
        Plan_map_Client_id: planMapClientData.Plan_map_Client_id,
        client_id: client ? {
          Clients_id: client.Clients_id,
          Business_Name: client.Business_Name,
          Email: client.Email
        } : null,
        plan_id: plan ? {
          Plan_id: plan.Plan_id,
          name: plan.name,
          plan_duration: plan.plan_duration
        } : null,
        PaymentStatus: planMapClientData.PaymentStatus,
        PlanExpiryDate: planMapClientData.PlanExpiryDate
      };
    }

    // Create response object with populated data
    const paymentResponse = updatedPayment.toObject();
    paymentResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    paymentResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    paymentResponse.Plan_map_Client_id = planMapClientResponse;
    paymentResponse.Transaction_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method,
      transactionType: transactionData.transactionType,
      reference_number: transactionData.reference_number
    } : null;
    paymentResponse.PaymentType_id = paymentTypeData ? {
      payment_type_id: paymentTypeData.payment_type_id,
      Name: paymentTypeData.Name
    } : null;
    paymentResponse.Payment = paymentData ? {
      Payment_id: paymentData.Payment_id,
      name: paymentData.name
    } : null;
    paymentResponse.Payment_Options_id = paymentOptionData ? {
      Payment_Options_id: paymentOptionData.Payment_Options_id,
      PaymentOption: paymentOptionData.PaymentOption
    } : null;

    res.status(200).json({
      success: true,
      message: 'Subscription payment updated successfully',
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subscription payment',
      error: error.message
    });
  }
};

// Get Subscriptions Payment by ID
const getSubscriptionsPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriptionPayment = await Subscriptions_Payment.findOne({ Subscriptions_Payment_id: parseInt(id) });

    if (!subscriptionPayment) {
      return res.status(404).json({
        success: false,
        message: 'Subscription payment not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, planMapClientData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
      subscriptionPayment.CreateBy ? User.findOne({ user_id: subscriptionPayment.CreateBy }) : null,
      subscriptionPayment.UpdatedBy ? User.findOne({ user_id: subscriptionPayment.UpdatedBy }) : null,
      Plan_map_Client.findOne({ Plan_map_Client_id: subscriptionPayment.Plan_map_Client_id }),
      subscriptionPayment.Transaction_id ? Transaction.findOne({ transagtion_id: subscriptionPayment.Transaction_id }) : null,
      subscriptionPayment.PaymentType_id ? payment_type.findOne({ payment_type_id: subscriptionPayment.PaymentType_id }) : null,
      subscriptionPayment.Payment ? Payments.findOne({ Payment_id: subscriptionPayment.Payment }) : null,
      subscriptionPayment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: subscriptionPayment.Payment_Options_id }) : null
    ]);

    // Populate Plan_map_Client data
    let planMapClientResponse = null;
    if (planMapClientData) {
      const [client, plan] = await Promise.all([
        Clients.findOne({ Clients_id: planMapClientData.client_id }),
        Plan.findOne({ Plan_id: planMapClientData.plan_id })
      ]);

      planMapClientResponse = {
        Plan_map_Client_id: planMapClientData.Plan_map_Client_id,
        client_id: client ? {
          Clients_id: client.Clients_id,
          Business_Name: client.Business_Name,
          Email: client.Email
        } : null,
        plan_id: plan ? {
          Plan_id: plan.Plan_id,
          name: plan.name,
          plan_duration: plan.plan_duration
        } : null,
        PaymentStatus: planMapClientData.PaymentStatus,
        PlanExpiryDate: planMapClientData.PlanExpiryDate
      };
    }

    // Create response object with populated data
    const paymentResponse = subscriptionPayment.toObject();
    paymentResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    paymentResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    paymentResponse.Plan_map_Client_id = planMapClientResponse;
    paymentResponse.Transaction_id = transactionData ? {
      transagtion_id: transactionData.transagtion_id,
      amount: transactionData.amount,
      status: transactionData.status,
      payment_method: transactionData.payment_method,
      transactionType: transactionData.transactionType,
      reference_number: transactionData.reference_number
    } : null;
    paymentResponse.PaymentType_id = paymentTypeData ? {
      payment_type_id: paymentTypeData.payment_type_id,
      Name: paymentTypeData.Name
    } : null;
    paymentResponse.Payment = paymentData ? {
      Payment_id: paymentData.Payment_id,
      name: paymentData.name
    } : null;
    paymentResponse.Payment_Options_id = paymentOptionData ? {
      Payment_Options_id: paymentOptionData.Payment_Options_id,
      PaymentOption: paymentOptionData.PaymentOption
    } : null;

    res.status(200).json({
      success: true,
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription payment',
      error: error.message
    });
  }
};

// Get All Subscriptions Payments
const getAllSubscriptionsPayments = async (req, res) => {
  try {
    const subscriptionPayments = await Subscriptions_Payment.find({ Status: true }).sort({ CreateAt: -1 });

    // Fetch related data for all subscription payments
    const paymentsResponse = await Promise.all(subscriptionPayments.map(async (payment) => {
      const [createByUser, updatedByUser, planMapClientData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
        payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
        payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null,
        Plan_map_Client.findOne({ Plan_map_Client_id: payment.Plan_map_Client_id }),
        payment.Transaction_id ? Transaction.findOne({ transagtion_id: payment.Transaction_id }) : null,
        payment.PaymentType_id ? payment_type.findOne({ payment_type_id: payment.PaymentType_id }) : null,
        payment.Payment ? Payments.findOne({ Payment_id: payment.Payment }) : null,
        payment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: payment.Payment_Options_id }) : null
      ]);

      // Populate Plan_map_Client data
      let planMapClientResponse = null;
      if (planMapClientData) {
        const [client, plan] = await Promise.all([
          Clients.findOne({ Clients_id: planMapClientData.client_id }),
          Plan.findOne({ Plan_id: planMapClientData.plan_id })
        ]);

        planMapClientResponse = {
          Plan_map_Client_id: planMapClientData.Plan_map_Client_id,
          client_id: client ? {
            Clients_id: client.Clients_id,
            Business_Name: client.Business_Name,
            Email: client.Email
          } : null,
          plan_id: plan ? {
            Plan_id: plan.Plan_id,
            name: plan.name,
            plan_duration: plan.plan_duration
          } : null,
          PaymentStatus: planMapClientData.PaymentStatus,
          PlanExpiryDate: planMapClientData.PlanExpiryDate
        };
      }

      const paymentObj = payment.toObject();
      paymentObj.CreateBy = createByUser ? {
        user_id: createByUser.user_id,
        Name: createByUser.Name,
        email: createByUser.email
      } : null;
      paymentObj.UpdatedBy = updatedByUser ? {
        user_id: updatedByUser.user_id,
        Name: updatedByUser.Name,
        email: updatedByUser.email
      } : null;
      paymentObj.Plan_map_Client_id = planMapClientResponse;
      paymentObj.Transaction_id = transactionData ? {
        transagtion_id: transactionData.transagtion_id,
        amount: transactionData.amount,
        status: transactionData.status,
        payment_method: transactionData.payment_method,
        transactionType: transactionData.transactionType,
        reference_number: transactionData.reference_number
      } : null;
      paymentObj.PaymentType_id = paymentTypeData ? {
        payment_type_id: paymentTypeData.payment_type_id,
        Name: paymentTypeData.Name
      } : null;
      paymentObj.Payment = paymentData ? {
        Payment_id: paymentData.Payment_id,
        name: paymentData.name
      } : null;
      paymentObj.Payment_Options_id = paymentOptionData ? {
        Payment_Options_id: paymentOptionData.Payment_Options_id,
        PaymentOption: paymentOptionData.PaymentOption
      } : null;

      return paymentObj;
    }));

    res.status(200).json({
      success: true,
      count: paymentsResponse.length,
      data: paymentsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription payments',
      error: error.message
    });
  }
};

// Get Subscriptions Payments by Auth (current logged in user)
const getSubscriptionsPaymentsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const subscriptionPayments = await Subscriptions_Payment.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });

    if (!subscriptionPayments || subscriptionPayments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription payments not found for current user'
      });
    }

    // Fetch related data for all subscription payments
    const paymentsResponse = await Promise.all(subscriptionPayments.map(async (payment) => {
      const [createByUser, updatedByUser, planMapClientData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
        payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
        payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null,
        Plan_map_Client.findOne({ Plan_map_Client_id: payment.Plan_map_Client_id }),
        payment.Transaction_id ? Transaction.findOne({ transagtion_id: payment.Transaction_id }) : null,
        payment.PaymentType_id ? payment_type.findOne({ payment_type_id: payment.PaymentType_id }) : null,
        payment.Payment ? Payments.findOne({ Payment_id: payment.Payment }) : null,
        payment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: payment.Payment_Options_id }) : null
      ]);

      // Populate Plan_map_Client data
      let planMapClientResponse = null;
      if (planMapClientData) {
        const [client, plan] = await Promise.all([
          Clients.findOne({ Clients_id: planMapClientData.client_id }),
          Plan.findOne({ Plan_id: planMapClientData.plan_id })
        ]);

        planMapClientResponse = {
          Plan_map_Client_id: planMapClientData.Plan_map_Client_id,
          client_id: client ? {
            Clients_id: client.Clients_id,
            Business_Name: client.Business_Name,
            Email: client.Email
          } : null,
          plan_id: plan ? {
            Plan_id: plan.Plan_id,
            name: plan.name,
            plan_duration: plan.plan_duration
          } : null,
          PaymentStatus: planMapClientData.PaymentStatus,
          PlanExpiryDate: planMapClientData.PlanExpiryDate
        };
      }

      const paymentObj = payment.toObject();
      paymentObj.CreateBy = createByUser ? {
        user_id: createByUser.user_id,
        Name: createByUser.Name,
        email: createByUser.email
      } : null;
      paymentObj.UpdatedBy = updatedByUser ? {
        user_id: updatedByUser.user_id,
        Name: updatedByUser.Name,
        email: updatedByUser.email
      } : null;
      paymentObj.Plan_map_Client_id = planMapClientResponse;
      paymentObj.Transaction_id = transactionData ? {
        transagtion_id: transactionData.transagtion_id,
        amount: transactionData.amount,
        status: transactionData.status,
        payment_method: transactionData.payment_method,
        transactionType: transactionData.transactionType,
        reference_number: transactionData.reference_number
      } : null;
      paymentObj.PaymentType_id = paymentTypeData ? {
        payment_type_id: paymentTypeData.payment_type_id,
        Name: paymentTypeData.Name
      } : null;
      paymentObj.Payment = paymentData ? {
        Payment_id: paymentData.Payment_id,
        name: paymentData.name
      } : null;
      paymentObj.Payment_Options_id = paymentOptionData ? {
        Payment_Options_id: paymentOptionData.Payment_Options_id,
        PaymentOption: paymentOptionData.PaymentOption
      } : null;

      return paymentObj;
    }));

    res.status(200).json({
      success: true,
      count: paymentsResponse.length,
      data: paymentsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription payments',
      error: error.message
    });
  }
};

// Get Subscriptions Payments by Plan_map_Client_id
const getSubscriptionsPaymentsByPlanMapClientId = async (req, res) => {
  try {
    const { planMapClientId } = req.params;

    const subscriptionPayments = await Subscriptions_Payment.find({
      Plan_map_Client_id: parseInt(planMapClientId),
      Status: true
    }).sort({ CreateAt: -1 });

    if (!subscriptionPayments || subscriptionPayments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription payments not found for this plan map client'
      });
    }

    // Fetch related data for all subscription payments
    const paymentsResponse = await Promise.all(subscriptionPayments.map(async (payment) => {
      const [createByUser, updatedByUser, planMapClientData, transactionData, paymentTypeData, paymentData, paymentOptionData] = await Promise.all([
        payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
        payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null,
        Plan_map_Client.findOne({ Plan_map_Client_id: payment.Plan_map_Client_id }),
        payment.Transaction_id ? Transaction.findOne({ transagtion_id: payment.Transaction_id }) : null,
        payment.PaymentType_id ? payment_type.findOne({ payment_type_id: payment.PaymentType_id }) : null,
        payment.Payment ? Payments.findOne({ Payment_id: payment.Payment }) : null,
        payment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: payment.Payment_Options_id }) : null
      ]);

      // Populate Plan_map_Client data
      let planMapClientResponse = null;
      if (planMapClientData) {
        const [client, plan] = await Promise.all([
          Clients.findOne({ Clients_id: planMapClientData.client_id }),
          Plan.findOne({ Plan_id: planMapClientData.plan_id })
        ]);

        planMapClientResponse = {
          Plan_map_Client_id: planMapClientData.Plan_map_Client_id,
          client_id: client ? {
            Clients_id: client.Clients_id,
            Business_Name: client.Business_Name,
            Email: client.Email
          } : null,
          plan_id: plan ? {
            Plan_id: plan.Plan_id,
            name: plan.name,
            plan_duration: plan.plan_duration
          } : null,
          PaymentStatus: planMapClientData.PaymentStatus,
          PlanExpiryDate: planMapClientData.PlanExpiryDate
        };
      }

      const paymentObj = payment.toObject();
      paymentObj.CreateBy = createByUser ? {
        user_id: createByUser.user_id,
        Name: createByUser.Name,
        email: createByUser.email
      } : null;
      paymentObj.UpdatedBy = updatedByUser ? {
        user_id: updatedByUser.user_id,
        Name: updatedByUser.Name,
        email: updatedByUser.email
      } : null;
      paymentObj.Plan_map_Client_id = planMapClientResponse;
      paymentObj.Transaction_id = transactionData ? {
        transagtion_id: transactionData.transagtion_id,
        amount: transactionData.amount,
        status: transactionData.status,
        payment_method: transactionData.payment_method,
        transactionType: transactionData.transactionType,
        reference_number: transactionData.reference_number
      } : null;
      paymentObj.PaymentType_id = paymentTypeData ? {
        payment_type_id: paymentTypeData.payment_type_id,
        Name: paymentTypeData.Name
      } : null;
      paymentObj.Payment = paymentData ? {
        Payment_id: paymentData.Payment_id,
        name: paymentData.name
      } : null;
      paymentObj.Payment_Options_id = paymentOptionData ? {
        Payment_Options_id: paymentOptionData.Payment_Options_id,
        PaymentOption: paymentOptionData.PaymentOption
      } : null;

      return paymentObj;
    }));

    res.status(200).json({
      success: true,
      count: paymentsResponse.length,
      data: paymentsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription payments',
      error: error.message
    });
  }
};

module.exports = {
  createSubscriptionsPayment,
  updateSubscriptionsPayment,
  getSubscriptionsPaymentById,
  getAllSubscriptionsPayments,
  getSubscriptionsPaymentsByAuth,
  getSubscriptionsPaymentsByPlanMapClientId
};

