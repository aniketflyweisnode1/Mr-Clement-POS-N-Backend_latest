const Business_settings = require('../models/Business_settings.model');
const User = require('../models/User.model');
const support_ticket = require('../models/support_ticket.model');

// Create Business Settings
const createBusinessSettings = async (req, res) => {
  try {
    const {
      subscriptionDetails,
      ActiveSubscriptions,
      inactiveSubscription,
      TurnOfSubscriptionPriceChange,
      BillHistory,
      allClients,
      NewClients,
      ActiveClients,
      InactiveClients,
      Status
    } = req.body;

    // Check Ticket_status in support_ticket model
    const ticketStatuses = await support_ticket.distinct('Ticket_status');
    const validTicketStatuses = ['Pending', 'Open', 'Process', 'Solve', 'Close'];
    
    // Validate that all ticket statuses are valid
    const invalidStatuses = ticketStatuses.filter(status => !validTicketStatuses.includes(status));
    if (invalidStatuses.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid ticket statuses found: ${invalidStatuses.join(', ')}. Valid statuses are: ${validTicketStatuses.join(', ')}`
      });
    }

    const businessSettings = new Business_settings({
      subscriptionDetails: subscriptionDetails !== undefined ? subscriptionDetails : true,
      ActiveSubscriptions,
      inactiveSubscription,
      TurnOfSubscriptionPriceChange,
      BillHistory,
      allClients,
      NewClients,
      ActiveClients,
      InactiveClients,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedBusinessSettings = await businessSettings.save();
    
    // Manually fetch related data
    const createByUser = savedBusinessSettings.CreateBy ? 
      await User.findOne({ user_id: savedBusinessSettings.CreateBy }) : null;

    // Create response object with populated data
    const businessSettingsResponse = savedBusinessSettings.toObject();
    businessSettingsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Business settings created successfully',
      data: businessSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating business settings',
      error: error.message
    });
  }
};

// Update Business Settings
const updateBusinessSettings = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Business Settings ID is required in request body'
      });
    }

    const businessSettings = await Business_settings.findOne({ Business_settings_id: parseInt(id) });
    if (!businessSettings) {
      return res.status(404).json({
        success: false,
        message: 'Business settings not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'Business_settings_id') {
        businessSettings[key] = updateData[key];
      }
    });

    businessSettings.UpdatedBy = userId;
    businessSettings.UpdatedAt = new Date();

    const updatedBusinessSettings = await businessSettings.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedBusinessSettings.CreateBy ? User.findOne({ user_id: updatedBusinessSettings.CreateBy }) : null,
      updatedBusinessSettings.UpdatedBy ? User.findOne({ user_id: updatedBusinessSettings.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const businessSettingsResponse = updatedBusinessSettings.toObject();
    businessSettingsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    businessSettingsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Business settings updated successfully',
      data: businessSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating business settings',
      error: error.message
    });
  }
};

// Get Business Settings by ID
const getBusinessSettingsById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const businessSettings = await Business_settings.findOne({ Business_settings_id: parseInt(id) });
    
    if (!businessSettings) {
      return res.status(404).json({
        success: false,
        message: 'Business settings not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      businessSettings.CreateBy ? User.findOne({ user_id: businessSettings.CreateBy }) : null,
      businessSettings.UpdatedBy ? User.findOne({ user_id: businessSettings.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const businessSettingsResponse = businessSettings.toObject();
    businessSettingsResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    businessSettingsResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: businessSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business settings',
      error: error.message
    });
  }
};

// Get All Business Settings
const getAllBusinessSettings = async (req, res) => {
  try {
    const businessSettings = await Business_settings.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all business settings
    const businessSettingsResponse = await Promise.all(businessSettings.map(async (businessSetting) => {
      const createByUser = businessSetting.CreateBy ? 
        await User.findOne({ user_id: businessSetting.CreateBy }) : null;

      const businessSettingObj = businessSetting.toObject();
      businessSettingObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return businessSettingObj;
    }));

    res.status(200).json({
      success: true,
      count: businessSettingsResponse.length,
      data: businessSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business settings',
      error: error.message
    });
  }
};

// Get Business Settings by Auth (current logged in user)
const getBusinessSettingsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const businessSettings = await Business_settings.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!businessSettings || businessSettings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business settings not found for current user'
      });
    }

    // Manually fetch related data for all business settings
    const businessSettingsResponse = await Promise.all(businessSettings.map(async (businessSetting) => {
      const [createByUser, updatedByUser] = await Promise.all([
        businessSetting.CreateBy ? User.findOne({ user_id: businessSetting.CreateBy }) : null,
        businessSetting.UpdatedBy ? User.findOne({ user_id: businessSetting.UpdatedBy }) : null
      ]);

      const businessSettingObj = businessSetting.toObject();
      businessSettingObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      businessSettingObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return businessSettingObj;
    }));

    res.status(200).json({
      success: true,
      count: businessSettingsResponse.length,
      data: businessSettingsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business settings',
      error: error.message
    });
  }
};

module.exports = {
  createBusinessSettings,
  updateBusinessSettings,
  getBusinessSettingsById,
  getAllBusinessSettings,
  getBusinessSettingsByAuth
};
