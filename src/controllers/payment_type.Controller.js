const payment_type = require('../models/payment_type.model');
const User = require('../models/User.model');

// Create Payment Type
const createPaymentType = async (req, res) => {
  try {
    const {
      Name,
      nodes,
      Status
    } = req.body;

    const paymentType = new payment_type({
      Name,
      nodes,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedPaymentType = await paymentType.save();
    
    // Manually fetch related data
    const createByUser = savedPaymentType.CreateBy ? 
      await User.findOne({ user_id: savedPaymentType.CreateBy }) : null;

    // Create response object with populated data
    const paymentTypeResponse = savedPaymentType.toObject();
    paymentTypeResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Payment type created successfully',
      data: paymentTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment type',
      error: error.message
    });
  }
};

// Update Payment Type
const updatePaymentType = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment Type ID is required in request body'
      });
    }

    const paymentType = await payment_type.findOne({ payment_type_id: parseInt(id) });
    if (!paymentType) {
      return res.status(404).json({
        success: false,
        message: 'Payment type not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'payment_type_id') {
        paymentType[key] = updateData[key];
      }
    });

    paymentType.UpdatedBy = userId;
    paymentType.UpdatedAt = new Date();

    const updatedPaymentType = await paymentType.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedPaymentType.CreateBy ? User.findOne({ user_id: updatedPaymentType.CreateBy }) : null,
      updatedPaymentType.UpdatedBy ? User.findOne({ user_id: updatedPaymentType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const paymentTypeResponse = updatedPaymentType.toObject();
    paymentTypeResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    paymentTypeResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Payment type updated successfully',
      data: paymentTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment type',
      error: error.message
    });
  }
};

// Get Payment Type by ID
const getPaymentTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentType = await payment_type.findOne({ payment_type_id: parseInt(id) });
    
    if (!paymentType) {
      return res.status(404).json({
        success: false,
        message: 'Payment type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      paymentType.CreateBy ? User.findOne({ user_id: paymentType.CreateBy }) : null,
      paymentType.UpdatedBy ? User.findOne({ user_id: paymentType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const paymentTypeResponse = paymentType.toObject();
    paymentTypeResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    paymentTypeResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: paymentTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment type',
      error: error.message
    });
  }
};

// Get All Payment Types
const getAllPaymentTypes = async (req, res) => {
  try {
    const paymentTypes = await payment_type.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all payment types
    const paymentTypesResponse = await Promise.all(paymentTypes.map(async (paymentType) => {
      const createByUser = paymentType.CreateBy ? 
        await User.findOne({ user_id: paymentType.CreateBy }) : null;

      const paymentTypeObj = paymentType.toObject();
      paymentTypeObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return paymentTypeObj;
    }));

    res.status(200).json({
      success: true,
      count: paymentTypesResponse.length,
      data: paymentTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment types',
      error: error.message
    });
  }
};

// Get Payment Type by Auth (current logged in user)
const getPaymentTypeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const paymentTypes = await payment_type.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!paymentTypes || paymentTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payment types not found for current user'
      });
    }

    // Manually fetch related data for all payment types
    const paymentTypesResponse = await Promise.all(paymentTypes.map(async (paymentType) => {
      const [createByUser, updatedByUser] = await Promise.all([
        paymentType.CreateBy ? User.findOne({ user_id: paymentType.CreateBy }) : null,
        paymentType.UpdatedBy ? User.findOne({ user_id: paymentType.UpdatedBy }) : null
      ]);

      const paymentTypeObj = paymentType.toObject();
      paymentTypeObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      paymentTypeObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return paymentTypeObj;
    }));

    res.status(200).json({
      success: true,
      count: paymentTypesResponse.length,
      data: paymentTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment types',
      error: error.message
    });
  }
};

// Delete Payment Type
const deletePaymentType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentType = await payment_type.findOne({ payment_type_id: parseInt(id) });
    
    if (!paymentType) {
      return res.status(404).json({
        success: false,
        message: 'Payment type not found'
      });
    }

    await payment_type.deleteOne({ payment_type_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Payment type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payment type',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentType,
  updatePaymentType,
  getPaymentTypeById,
  getAllPaymentTypes,
  getPaymentTypeByAuth,
  deletePaymentType
};
