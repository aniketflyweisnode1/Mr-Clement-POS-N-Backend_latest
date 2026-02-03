const Tax_setup = require('../models/Tax_setup.model');
const User = require('../models/User.model');

// Create Tax Setup
const createTaxSetup = async (req, res) => {
  try {
    const {
      title,
      rate,
      servicecharge,
      type,
      Status
    } = req.body;

    const taxSetup = new Tax_setup({
      title,
      rate,
      servicecharge,
      type,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedTaxSetup = await taxSetup.save();
    
    // Manually fetch related data
    const createByUser = savedTaxSetup.CreateBy ? 
      await User.findOne({ user_id: savedTaxSetup.CreateBy }) : null;

    // Create response object with populated data
    const taxSetupResponse = savedTaxSetup.toObject();
    taxSetupResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Tax setup created successfully',
      data: taxSetupResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating tax setup',
      error: error.message
    });
  }
};

// Update Tax Setup
const updateTaxSetup = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Tax Setup ID is required in request body'
      });
    }

    const taxSetup = await Tax_setup.findOne({ Tax_setup_id: parseInt(id) });
    if (!taxSetup) {
      return res.status(404).json({
        success: false,
        message: 'Tax setup not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Tax_setup_id') {
        taxSetup[key] = updateData[key];
      }
    });

    taxSetup.UpdatedBy = userId;
    taxSetup.UpdatedAt = new Date();

    const updatedTaxSetup = await taxSetup.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedTaxSetup.CreateBy ? User.findOne({ user_id: updatedTaxSetup.CreateBy }) : null,
      updatedTaxSetup.UpdatedBy ? User.findOne({ user_id: updatedTaxSetup.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const taxSetupResponse = updatedTaxSetup.toObject();
    taxSetupResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    taxSetupResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Tax setup updated successfully',
      data: taxSetupResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating tax setup',
      error: error.message
    });
  }
};

// Get Tax Setup by ID
const getTaxSetupById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const taxSetup = await Tax_setup.findOne({ Tax_setup_id: parseInt(id) });
    
    if (!taxSetup) {
      return res.status(404).json({
        success: false,
        message: 'Tax setup not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      taxSetup.CreateBy ? User.findOne({ user_id: taxSetup.CreateBy }) : null,
      taxSetup.UpdatedBy ? User.findOne({ user_id: taxSetup.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const taxSetupResponse = taxSetup.toObject();
    taxSetupResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    taxSetupResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: taxSetupResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tax setup',
      error: error.message
    });
  }
};

// Get All Tax Setups
const getAllTaxSetups = async (req, res) => {
  try {
    const taxSetups = await Tax_setup.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all tax setups
    const taxSetupsResponse = await Promise.all(taxSetups.map(async (taxSetup) => {
      const createByUser = taxSetup.CreateBy ? 
        await User.findOne({ user_id: taxSetup.CreateBy }) : null;

      const taxSetupObj = taxSetup.toObject();
      taxSetupObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return taxSetupObj;
    }));

    res.status(200).json({
      success: true,
      count: taxSetupsResponse.length,
      data: taxSetupsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tax setups',
      error: error.message
    });
  }
};

// Get Tax Setup by Auth (current logged in user)
const getTaxSetupByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { servicecharge } = req.query;
    
    // Build filter object
    const filter = {
      CreateBy: userId,
      Status: true
    };
    
    // Add servicecharge filter if servicecharge query parameter is provided
    if (servicecharge !== undefined && servicecharge !== null && servicecharge !== '') {
      const servicechargeValue = parseFloat(servicecharge);
      if (!isNaN(servicechargeValue)) {
        filter.servicecharge = servicechargeValue;
      }
    }
    
    const taxSetups = await Tax_setup.find(filter).sort({ CreateAt: -1 });
    
    if (!taxSetups || taxSetups.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tax setups not found for current user'
      });
    }

    // Manually fetch related data for all tax setups
    const taxSetupsResponse = await Promise.all(taxSetups.map(async (taxSetup) => {
      const [createByUser, updatedByUser] = await Promise.all([
        taxSetup.CreateBy ? User.findOne({ user_id: taxSetup.CreateBy }) : null,
        taxSetup.UpdatedBy ? User.findOne({ user_id: taxSetup.UpdatedBy }) : null
      ]);

      const taxSetupObj = taxSetup.toObject();
      taxSetupObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      taxSetupObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return taxSetupObj;
    }));

    res.status(200).json({
      success: true,
      count: taxSetupsResponse.length,
      data: taxSetupsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching tax setups',
      error: error.message
    });
  }
};

// Delete Tax Setup
const deleteTaxSetup = async (req, res) => {
  try {
    const { id } = req.params;
    
    const taxSetup = await Tax_setup.findOne({ Tax_setup_id: parseInt(id) });
    
    if (!taxSetup) {
      return res.status(404).json({
        success: false,
        message: 'Tax setup not found'
      });
    }

    await Tax_setup.deleteOne({ Tax_setup_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Tax setup deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting tax setup',
      error: error.message
    });
  }
};

module.exports = {
  createTaxSetup,
  updateTaxSetup,
  getTaxSetupById,
  getAllTaxSetups,
  getTaxSetupByAuth,
  deleteTaxSetup
};
