const Payment_Options = require('../models/Payment_Options.model');
const User = require('../models/User.model');

// Create Payment Option
const createPaymentOption = async (req, res) => {
  try {
    const { PaymentOption, Status } = req.body;
    const userId = req.user.user_id;

    if (!PaymentOption || !Array.isArray(PaymentOption) || PaymentOption.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'PaymentOption array is required and must contain at least one option'
      });
    }

    // Validate PaymentOption structure
    for (const option of PaymentOption) {
      if (!option.option || typeof option.option !== 'string') {
        return res.status(400).json({
          success: false,
          message: 'Each PaymentOption must have an "option" field (string)'
        });
      }
    }

    const paymentOption = new Payment_Options({
      PaymentOption,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId,
      CreateAt: new Date()
    });

    const savedPaymentOption = await paymentOption.save();

    res.status(201).json({
      success: true,
      message: 'Payment option created successfully',
      data: savedPaymentOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating payment option',
      error: error.message
    });
  }
};

// Update Payment Option
const updatePaymentOption = async (req, res) => {
  try {
    const { id } = req.params;
    const { PaymentOption, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment option ID is required'
      });
    }

    const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(id) });
    if (!paymentOption) {
      return res.status(404).json({
        success: false,
        message: 'Payment option not found'
      });
    }

    // Update fields if provided
    if (PaymentOption !== undefined) {
      if (!Array.isArray(PaymentOption) || PaymentOption.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'PaymentOption must be a non-empty array'
        });
      }
      // Validate PaymentOption structure
      for (const option of PaymentOption) {
        if (!option.option || typeof option.option !== 'string') {
          return res.status(400).json({
            success: false,
            message: 'Each PaymentOption must have an "option" field (string)'
          });
        }
      }
      paymentOption.PaymentOption = PaymentOption;
    }
    if (Status !== undefined) paymentOption.Status = Status;
    paymentOption.UpdatedBy = userId;
    paymentOption.UpdatedAt = new Date();

    const updatedPaymentOption = await paymentOption.save();

    res.status(200).json({
      success: true,
      message: 'Payment option updated successfully',
      data: updatedPaymentOption
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating payment option',
      error: error.message
    });
  }
};

// Get Payment Option by ID
const getPaymentOptionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment option ID is required'
      });
    }

    const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(id) });
    if (!paymentOption) {
      return res.status(404).json({
        success: false,
        message: 'Payment option not found'
      });
    }

    // Populate CreateBy and UpdatedBy
    const [createByUser, updatedByUser] = await Promise.all([
      paymentOption.CreateBy ? User.findOne({ user_id: paymentOption.CreateBy }) : null,
      paymentOption.UpdatedBy ? User.findOne({ user_id: paymentOption.UpdatedBy }) : null
    ]);

    const paymentOptionResponse = paymentOption.toObject();
    paymentOptionResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    paymentOptionResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Payment option retrieved successfully',
      data: paymentOptionResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment option',
      error: error.message
    });
  }
};

// Get All Payment Options
const getAllPaymentOptions = async (req, res) => {
  try {
    const { Status } = req.query;
    
    const query = {};
    if (Status !== undefined) {
      query.Status = Status === 'true' || Status === true;
    }

    const paymentOptions = await Payment_Options.find(query).sort({ CreateAt: -1 });

    // Populate CreateBy and UpdatedBy for all payment options
    const paymentOptionsWithUsers = await Promise.all(
      paymentOptions.map(async (paymentOption) => {
        const [createByUser, updatedByUser] = await Promise.all([
          paymentOption.CreateBy ? User.findOne({ user_id: paymentOption.CreateBy }) : null,
          paymentOption.UpdatedBy ? User.findOne({ user_id: paymentOption.UpdatedBy }) : null
        ]);

        const paymentOptionObj = paymentOption.toObject();
        paymentOptionObj.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        paymentOptionObj.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return paymentOptionObj;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Payment options retrieved successfully',
      data: paymentOptionsWithUsers,
      count: paymentOptionsWithUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment options',
      error: error.message
    });
  }
};

// Delete Payment Option
const deletePaymentOption = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Payment option ID is required'
      });
    }

    const paymentOption = await Payment_Options.findOne({ Payment_Options_id: parseInt(id) });
    if (!paymentOption) {
      return res.status(404).json({
        success: false,
        message: 'Payment option not found'
      });
    }

    // Soft delete by setting Status to false
    paymentOption.Status = false;
    paymentOption.UpdatedAt = new Date();
    await paymentOption.save();

    res.status(200).json({
      success: true,
      message: 'Payment option deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payment option',
      error: error.message
    });
  }
};

// Get Payment Options by Authenticated User
const getPaymentOptionsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const paymentOptions = await Payment_Options.find({ 
      CreateBy: userId,
      Status: true 
    }).sort({ CreateAt: -1 });

    // Populate CreateBy and UpdatedBy
    const paymentOptionsWithUsers = await Promise.all(
      paymentOptions.map(async (paymentOption) => {
        const [createByUser, updatedByUser] = await Promise.all([
          paymentOption.CreateBy ? User.findOne({ user_id: paymentOption.CreateBy }) : null,
          paymentOption.UpdatedBy ? User.findOne({ user_id: paymentOption.UpdatedBy }) : null
        ]);

        const paymentOptionObj = paymentOption.toObject();
        paymentOptionObj.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        paymentOptionObj.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return paymentOptionObj;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Payment options retrieved successfully',
      data: paymentOptionsWithUsers,
      count: paymentOptionsWithUsers.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment options',
      error: error.message
    });
  }
};

module.exports = {
  createPaymentOption,
  updatePaymentOption,
  getPaymentOptionById,
  getAllPaymentOptions,
  deletePaymentOption,
  getPaymentOptionsByAuth
};

