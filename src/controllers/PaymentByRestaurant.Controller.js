const PaymentByRestaurant = require('../models/PaymentByRestaurant.model');
const Payment_Options = require('../models/Payment_Options.model');
const Transaction = require('../models/Transaction.model');
const Pos_Point_sales_Order = require('../models/Pos_Point_sales_Order.model');
const User = require('../models/User.model');

// Create Payment by Restaurant
const createPaymentByRestaurant = async (req, res) => {
  try {
    const { Payment_Options_id, paymentStatus, Order_id } = req.body;
    const userId = req.user.user_id;

    if (!Payment_Options_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment_Options_id is required'
      });
    }

    // Validate Payment_Options_id exists
    const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(Payment_Options_id) });
    if (!paymentOption) {
      return res.status(404).json({
        success: false,
        message: 'Payment option not found'
      });
    }

    // Validate paymentStatus if provided
    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['Pending', 'Failed', 'Cancelled', 'Success'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
    }

    // Validate Order_id if provided and get order details
    let order = null;
    let transactionAmount = 0;
    if (Order_id !== undefined && Order_id !== null) {
      order = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(Order_id) });
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
      transactionAmount = order.Total || 0;
    }

    // Get payment method from Payment_Options (use first option's option field as payment method)
    const paymentMethod = paymentOption.PaymentOption && paymentOption.PaymentOption.length > 0
      ? paymentOption.PaymentOption[0].option
      : 'Cash'; // Default to 'Cash' if no payment option details

    // Automatically create Transaction
    const transaction = new Transaction({
      user_id: userId,
      amount: transactionAmount,
      status: paymentStatus === 'Success' ? 'success' : paymentStatus === 'Failed' ? 'failed' : 'Pending',
      payment_method: paymentMethod,
      transactionType: 'Order_Payment', // You can change this to a specific type for restaurant payments
      transaction_date: new Date(),
      reference_number: Order_id ? `ORDER-${Order_id}` : null,
      created_by: userId,
      created_at: new Date()
    });

    const savedTransaction = await transaction.save();

    // Create payment with auto-generated transaction ID
    const payment = new PaymentByRestaurant({
      Payment_Options_id: parseInt(Payment_Options_id),
      paymentStatus: paymentStatus || 'Pending',
      Trangection_id: savedTransaction.transagtion_id,
      Order_id: Order_id ? parseInt(Order_id) : null,
      Status: true,
      CreateBy: userId,
      CreateAt: new Date()
    });

    const savedPayment = await payment.save();

    // Update order's payment_status and transaction_id if order exists
    if (order) {
      order.payment_status = paymentStatus || 'Pending';
      order.transaction_id = savedTransaction.transagtion_id;
      await order.save();
    }

    // Populate payment response with transaction details
    const paymentResponse = savedPayment.toObject();
    paymentResponse.Trangection_id = {
      transagtion_id: savedTransaction.transagtion_id,
      amount: savedTransaction.amount,
      status: savedTransaction.status,
      payment_method: savedTransaction.payment_method,
      transactionType: savedTransaction.transactionType,
      reference_number: savedTransaction.reference_number
    };

    res.status(201).json({
      success: true,
      message: 'Payment by restaurant created successfully',
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment by restaurant',
      error: error.message
    });
  }
};

// Update Payment by Restaurant
const updatePaymentByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const { Payment_Options_id, paymentStatus, Trangection_id, Order_id, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await PaymentByRestaurant.findOne({ PaymentByRestaurant_id: parseInt(id) });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update fields if provided
    if (Payment_Options_id !== undefined) {
      const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(Payment_Options_id) });
      if (!paymentOption) {
        return res.status(404).json({
          success: false,
          message: 'Payment option not found'
        });
      }
      payment.Payment_Options_id = parseInt(Payment_Options_id);
    }

    if (paymentStatus !== undefined) {
      const validPaymentStatuses = ['Pending', 'Failed', 'Cancelled', 'Success'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: `Invalid paymentStatus. Must be one of: ${validPaymentStatuses.join(', ')}`
        });
      }
      payment.paymentStatus = paymentStatus;
    }

    if (Trangection_id !== undefined) {
      if (Trangection_id !== null) {
        const transaction = await Transaction.findOne({ transagtion_id: parseInt(Trangection_id) });
        if (!transaction) {
          return res.status(404).json({
            success: false,
            message: 'Transaction not found'
          });
        }
        payment.Trangection_id = parseInt(Trangection_id);
      } else {
        payment.Trangection_id = null;
      }
    }

    if (Order_id !== undefined) {
      if (Order_id !== null) {
        const order = await Pos_Point_sales_Order.findOne({ POS_Order_id: parseInt(Order_id) });
        if (!order) {
          return res.status(404).json({
            success: false,
            message: 'Order not found'
          });
        }
        payment.Order_id = parseInt(Order_id);
      } else {
        payment.Order_id = null;
      }
    }

    if (Status !== undefined) payment.Status = Status;
    payment.UpdatedBy = userId;
    payment.UpdatedAt = new Date();

    const updatedPayment = await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment by restaurant updated successfully',
      data: updatedPayment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment by restaurant',
      error: error.message
    });
  }
};

// Get Payment by Restaurant by ID
const getPaymentByRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await PaymentByRestaurant.findOne({ PaymentByRestaurant_id: parseInt(id) });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Populate related data
    const [paymentOption, transaction, order, createByUser, updatedByUser] = await Promise.all([
      payment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: payment.Payment_Options_id }) : null,
      payment.Trangection_id ? Transaction.findOne({ transagtion_id: payment.Trangection_id }) : null,
      payment.Order_id ? Pos_Point_sales_Order.findOne({ POS_Order_id: payment.Order_id }) : null,
      payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
      payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null
    ]);

    const paymentResponse = payment.toObject();
    paymentResponse.Payment_Options_id = paymentOption ? {
      Payment_Options_id: paymentOption.Payment_Options_id,
      PaymentOption: paymentOption.PaymentOption
    } : null;
    paymentResponse.Trangection_id = transaction ? {
      transagtion_id: transaction.transagtion_id,
      amount: transaction.amount,
      status: transaction.status,
      payment_method: transaction.payment_method
    } : null;
    paymentResponse.Order_id = order ? {
      POS_Order_id: order.POS_Order_id,
      Total: order.Total,
      SubTotal: order.SubTotal,
      Tax: order.Tax,
      Dining_Option: order.Dining_Option,
      Table_id: order.Table_id,
      Order_Status: order.Order_Status,
      payment_status: order.payment_status
    } : null;
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

    res.status(200).json({
      success: true,
      message: 'Payment by restaurant retrieved successfully',
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment by restaurant',
      error: error.message
    });
  }
};

// Get All Payments by Restaurant
const getAllPaymentsByRestaurant = async (req, res) => {
  try {
    const { Status, paymentStatus } = req.query;
    
    const query = {};
    if (Status !== undefined) {
      query.Status = Status === 'true' || Status === true;
    }
    if (paymentStatus !== undefined) {
      query.paymentStatus = paymentStatus;
    }

    const payments = await PaymentByRestaurant.find(query).sort({ CreateAt: -1 });

    // Populate related data for all payments
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const [paymentOption, transaction, order, createByUser, updatedByUser] = await Promise.all([
          payment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: payment.Payment_Options_id }) : null,
          payment.Trangection_id ? Transaction.findOne({ transagtion_id: payment.Trangection_id }) : null,
          payment.Order_id ? Pos_Point_sales_Order.findOne({ POS_Order_id: payment.Order_id }) : null,
          payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
          payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null
        ]);

        const paymentObj = payment.toObject();
        paymentObj.Payment_Options_id = paymentOption ? {
          Payment_Options_id: paymentOption.Payment_Options_id,
          PaymentOption: paymentOption.PaymentOption
        } : null;
        paymentObj.Trangection_id = transaction ? {
          transagtion_id: transaction.transagtion_id,
          amount: transaction.amount,
          status: transaction.status,
          payment_method: transaction.payment_method
        } : null;
        paymentObj.Order_id = order ? {
          POS_Order_id: order.POS_Order_id,
          Total: order.Total,
          SubTotal: order.SubTotal,
          Tax: order.Tax,
          Dining_Option: order.Dining_Option,
          Table_id: order.Table_id,
          Order_Status: order.Order_Status,
          payment_status: order.payment_status
        } : null;
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

        return paymentObj;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Payments by restaurant retrieved successfully',
      data: paymentsWithDetails,
      count: paymentsWithDetails.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments by restaurant',
      error: error.message
    });
  }
};

// Delete Payment by Restaurant
const deletePaymentByRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required'
      });
    }

    const payment = await PaymentByRestaurant.findOne({ PaymentByRestaurant_id: parseInt(id) });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Soft delete by setting Status to false
    payment.Status = false;
    payment.UpdatedAt = new Date();
    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment by restaurant deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payment by restaurant',
      error: error.message
    });
  }
};

// Get Payments by Payment Options
const getPaymentsByPaymentOptions = async (req, res) => {
  try {
    const { paymentOptionsId } = req.params;

    if (!paymentOptionsId) {
      return res.status(400).json({
        success: false,
        message: 'Payment Options ID is required'
      });
    }

    const payments = await PaymentByRestaurant.find({ 
      Payment_Options_id: parseInt(paymentOptionsId),
      Status: true 
    }).sort({ CreateAt: -1 });

    // Populate related data
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const [paymentOption, transaction, order, createByUser, updatedByUser] = await Promise.all([
          payment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: payment.Payment_Options_id }) : null,
          payment.Trangection_id ? Transaction.findOne({ transagtion_id: payment.Trangection_id }) : null,
          payment.Order_id ? Pos_Point_sales_Order.findOne({ POS_Order_id: payment.Order_id }) : null,
          payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
          payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null
        ]);

        const paymentObj = payment.toObject();
        paymentObj.Payment_Options_id = paymentOption ? {
          Payment_Options_id: paymentOption.Payment_Options_id,
          PaymentOption: paymentOption.PaymentOption
        } : null;
        paymentObj.Trangection_id = transaction ? {
          transagtion_id: transaction.transagtion_id,
          amount: transaction.amount,
          status: transaction.status,
          payment_method: transaction.payment_method
        } : null;
        paymentObj.Order_id = order ? {
          POS_Order_id: order.POS_Order_id,
          Total: order.Total,
          SubTotal: order.SubTotal,
          Tax: order.Tax,
          Dining_Option: order.Dining_Option,
          Table_id: order.Table_id,
          Order_Status: order.Order_Status,
          payment_status: order.payment_status
        } : null;
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

        return paymentObj;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Payments by payment options retrieved successfully',
      data: paymentsWithDetails,
      count: paymentsWithDetails.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments by payment options',
      error: error.message
    });
  }
};

// Get Payments by Authenticated User
const getPaymentsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const payments = await PaymentByRestaurant.find({ 
      CreateBy: userId,
      Status: true 
    }).sort({ CreateAt: -1 });

    // Populate related data
    const paymentsWithDetails = await Promise.all(
      payments.map(async (payment) => {
        const [paymentOption, transaction, order, createByUser, updatedByUser] = await Promise.all([
          payment.Payment_Options_id ? Payment_Options.findOne({ Payment_Options_id: payment.Payment_Options_id }) : null,
          payment.Trangection_id ? Transaction.findOne({ transagtion_id: payment.Trangection_id }) : null,
          payment.Order_id ? Pos_Point_sales_Order.findOne({ POS_Order_id: payment.Order_id }) : null,
          payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
          payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null
        ]);

        const paymentObj = payment.toObject();
        paymentObj.Payment_Options_id = paymentOption ? {
          Payment_Options_id: paymentOption.Payment_Options_id,
          PaymentOption: paymentOption.PaymentOption
        } : null;
        paymentObj.Trangection_id = transaction ? {
          transagtion_id: transaction.transagtion_id,
          amount: transaction.amount,
          status: transaction.status,
          payment_method: transaction.payment_method
        } : null;
        paymentObj.Order_id = order ? {
          POS_Order_id: order.POS_Order_id,
          Total: order.Total,
          SubTotal: order.SubTotal,
          Tax: order.Tax,
          Dining_Option: order.Dining_Option,
          Table_id: order.Table_id,
          Order_Status: order.Order_Status,
          payment_status: order.payment_status
        } : null;
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

        return paymentObj;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Payments by restaurant retrieved successfully',
      data: paymentsWithDetails,
      count: paymentsWithDetails.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payments by restaurant',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentByRestaurant,
  updatePaymentByRestaurant,
  getPaymentByRestaurantById,
  getAllPaymentsByRestaurant,
  deletePaymentByRestaurant,
  getPaymentsByPaymentOptions,
  getPaymentsByAuth
};

