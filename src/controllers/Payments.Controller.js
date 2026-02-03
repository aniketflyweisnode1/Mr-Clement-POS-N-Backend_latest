const Payments = require('../models/Payments.model');
const User = require('../models/User.model');

// Create Payment
const createPayment = async (req, res) => {
  try {
    const {
      name,
      Status
    } = req.body;

    const payment = new Payments({
      name,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedPayment = await payment.save();
    
    // Manually fetch related data
    const createByUser = savedPayment.CreateBy ? 
      await User.findOne({ user_id: savedPayment.CreateBy }) : null;

    // Create response object with populated data
    const paymentResponse = savedPayment.toObject();
    paymentResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment',
      error: error.message
    });
  }
};

// Update Payment
const updatePayment = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment ID is required in request body'
      });
    }

    const payment = await Payments.findOne({ Payment_id: parseInt(id) });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Payment_id') {
        payment[key] = updateData[key];
      }
    });

    payment.UpdatedBy = userId;
    payment.UpdatedAt = new Date();

    const updatedPayment = await payment.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedPayment.CreateBy ? User.findOne({ user_id: updatedPayment.CreateBy }) : null,
      updatedPayment.UpdatedBy ? User.findOne({ user_id: updatedPayment.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const paymentResponse = updatedPayment.toObject();
    paymentResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    paymentResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Payment updated successfully',
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment',
      error: error.message
    });
  }
};

// Get Payment by ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await Payments.findOne({ Payment_id: parseInt(id) });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
      payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const paymentResponse = payment.toObject();
    paymentResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    paymentResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: paymentResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment',
      error: error.message
    });
  }
};

// Get All Payments
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payments.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all payments
    const paymentsResponse = await Promise.all(payments.map(async (payment) => {
      const createByUser = payment.CreateBy ? 
        await User.findOne({ user_id: payment.CreateBy }) : null;

      const paymentObj = payment.toObject();
      paymentObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

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
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

// Get Payment by Auth (current logged in user)
const getPaymentByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const payments = await Payments.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!payments || payments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payments not found for current user'
      });
    }

    // Manually fetch related data for all payments
    const paymentsResponse = await Promise.all(payments.map(async (payment) => {
      const [createByUser, updatedByUser] = await Promise.all([
        payment.CreateBy ? User.findOne({ user_id: payment.CreateBy }) : null,
        payment.UpdatedBy ? User.findOne({ user_id: payment.UpdatedBy }) : null
      ]);

      const paymentObj = payment.toObject();
      paymentObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      paymentObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

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
      message: 'Error fetching payments',
      error: error.message
    });
  }
};

module.exports = {
  createPayment,
  updatePayment,
  getPaymentById,
  getAllPayments,
  getPaymentByAuth
};
