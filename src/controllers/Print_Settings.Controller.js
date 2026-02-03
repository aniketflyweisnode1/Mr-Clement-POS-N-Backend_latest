const Print_Settings = require('../models/Print_Settings.model');
const User = require('../models/User.model');
const Store_details = require('../models/Store_details.model');
const Customer = require('../models/Customer.model');

// Create Print Settings
const createPrintSettings = async (req, res) => {
  try {
    const {
      enable_print,
      show_store_details,
      show_customer_details,
      store_id,
      customer_id,
      pagesize,
      Header,
      footer,
      show_notes,
      printToken,
      Status
    } = req.body;

    const printSettings = new Print_Settings({
      enable_print: enable_print !== undefined ? enable_print : true,
      show_store_details: show_store_details !== undefined ? show_store_details : true,
      show_customer_details: show_customer_details !== undefined ? show_customer_details : true,
      store_id,
      customer_id,
      pagesize: pagesize || 'A4',
      Header,
      footer,
      show_notes: show_notes !== undefined ? show_notes : true,
      printToken: printToken !== undefined ? printToken : true,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedPrintSettings = await printSettings.save();
    
    // Manually fetch related data
    const [createByUser, storeDetails, customer] = await Promise.all([
      savedPrintSettings.CreateBy ? User.findOne({ user_id: savedPrintSettings.CreateBy }) : null,
      savedPrintSettings.store_id ? Store_details.findOne({ Store_id: savedPrintSettings.store_id }) : null,
      savedPrintSettings.customer_id ? Customer.findOne({ Customer_id: savedPrintSettings.customer_id }) : null
    ]);

    // Create response object with populated data
    const printSettingsResponse = savedPrintSettings.toObject();
    printSettingsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    printSettingsResponse.store_id = storeDetails ? 
      { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;
    printSettingsResponse.customer_id = customer ? 
      { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;
    
    res.status(201).json({
      success: true,
      message: 'Print settings created successfully',
      data: printSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating print settings',
      error: error.message
    });
  }
};

// Update Print Settings
const updatePrintSettings = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Print Settings ID is required in request body'
      });
    }

    const printSettings = await Print_Settings.findOne({ Print_Settings_id: parseInt(id) });
    if (!printSettings) {
      return res.status(404).json({
        success: false,
        message: 'Print settings not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Print_Settings_id') {
        printSettings[key] = updateData[key];
      }
    });

    printSettings.UpdatedBy = userId;
    printSettings.UpdatedAt = new Date();

    const updatedPrintSettings = await printSettings.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser, storeDetails, customer] = await Promise.all([
      updatedPrintSettings.CreateBy ? User.findOne({ user_id: updatedPrintSettings.CreateBy }) : null,
      updatedPrintSettings.UpdatedBy ? User.findOne({ user_id: updatedPrintSettings.UpdatedBy }) : null,
      updatedPrintSettings.store_id ? Store_details.findOne({ Store_id: updatedPrintSettings.store_id }) : null,
      updatedPrintSettings.customer_id ? Customer.findOne({ Customer_id: updatedPrintSettings.customer_id }) : null
    ]);

    // Create response object with populated data
    const printSettingsResponse = updatedPrintSettings.toObject();
    printSettingsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    printSettingsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    printSettingsResponse.store_id = storeDetails ? 
      { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;
    printSettingsResponse.customer_id = customer ? 
      { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;
    
    res.status(200).json({
      success: true,
      message: 'Print settings updated successfully',
      data: printSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating print settings',
      error: error.message
    });
  }
};

// Get Print Settings by ID
const getPrintSettingsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const printSettings = await Print_Settings.findOne({ Print_Settings_id: parseInt(id) });
    
    if (!printSettings) {
      return res.status(404).json({
        success: false,
        message: 'Print settings not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser, storeDetails, customer] = await Promise.all([
      printSettings.CreateBy ? User.findOne({ user_id: printSettings.CreateBy }) : null,
      printSettings.UpdatedBy ? User.findOne({ user_id: printSettings.UpdatedBy }) : null,
      printSettings.store_id ? Store_details.findOne({ Store_id: printSettings.store_id }) : null,
      printSettings.customer_id ? Customer.findOne({ Customer_id: printSettings.customer_id }) : null
    ]);

    // Create response object with populated data
    const printSettingsResponse = printSettings.toObject();
    printSettingsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    printSettingsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    printSettingsResponse.store_id = storeDetails ? 
      { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;
    printSettingsResponse.customer_id = customer ? 
      { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;

    res.status(200).json({
      success: true,
      data: printSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching print settings',
      error: error.message
    });
  }
};

// Get All Print Settings
const getAllPrintSettings = async (req, res) => {
  try {
    const printSettingsList = await Print_Settings.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all print settings
    const printSettingsResponse = await Promise.all(printSettingsList.map(async (printSettings) => {
      const [createByUser, storeDetails, customer] = await Promise.all([
        printSettings.CreateBy ? User.findOne({ user_id: printSettings.CreateBy }) : null,
        printSettings.store_id ? Store_details.findOne({ Store_id: printSettings.store_id }) : null,
        printSettings.customer_id ? Customer.findOne({ Customer_id: printSettings.customer_id }) : null
      ]);

      const printSettingsObj = printSettings.toObject();
      printSettingsObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      printSettingsObj.store_id = storeDetails ? 
        { Store_id: storeDetails.Store_id, address: storeDetails.address, email: storeDetails.email } : null;
      printSettingsObj.customer_id = customer ? 
        { Customer_id: customer.Customer_id, Name: customer.Name, phone: customer.phone } : null;

      return printSettingsObj;
    }));

    res.status(200).json({
      success: true,
      count: printSettingsResponse.length,
      data: printSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching print settings',
      error: error.message
    });
  }
};

// Delete Print Settings
const deletePrintSettings = async (req, res) => {
  try {
    const { id } = req.params;
    
    const printSettings = await Print_Settings.findOne({ Print_Settings_id: parseInt(id) });
    
    if (!printSettings) {
      return res.status(404).json({
        success: false,
        message: 'Print settings not found'
      });
    }

    await Print_Settings.deleteOne({ Print_Settings_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Print settings deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting print settings',
      error: error.message
    });
  }
};

// Get Print Settings by Auth (current logged in user)
const getPrintSettingsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const printSettings = await Print_Settings.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!printSettings || printSettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Print settings not found for current user'
      });
    }

    // Manually fetch related data for all print settings
    const printSettingsResponse = await Promise.all(printSettings.map(async (printSetting) => {
      const [createByUser, updatedByUser] = await Promise.all([
        printSetting.CreateBy ? User.findOne({ user_id: printSetting.CreateBy }) : null,
        printSetting.UpdatedBy ? User.findOne({ user_id: printSetting.UpdatedBy }) : null
      ]);

      const printSettingObj = printSetting.toObject();
      printSettingObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      printSettingObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return printSettingObj;
    }));

    res.status(200).json({
      success: true,
      count: printSettingsResponse.length,
      data: printSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching print settings',
      error: error.message
    });
  }
};

module.exports = {
  createPrintSettings,
  updatePrintSettings,
  getPrintSettingsById,
  getAllPrintSettings,
  getPrintSettingsByAuth,
  deletePrintSettings
};
