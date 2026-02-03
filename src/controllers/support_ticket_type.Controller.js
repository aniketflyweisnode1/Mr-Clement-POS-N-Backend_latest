const support_ticket_type = require('../models/support_ticket_type.model');
const User = require('../models/User.model');

// Create Support Ticket Type
const createSupportTicketType = async (req, res) => {
  try {
    const {
      Name,
      nodes,
      Status
    } = req.body;

    const supportTicketType = new support_ticket_type({
      Name,
      nodes,
      Status: Status !== undefined ? Status : true,
      CreateBy: req.user?.user_id || null
    });

    const savedSupportTicketType = await supportTicketType.save();
    
    // Manually fetch related data
    const createByUser = savedSupportTicketType.CreateBy ? 
      await User.findOne({ user_id: savedSupportTicketType.CreateBy }) : null;

    // Create response object with populated data
    const supportTicketTypeResponse = savedSupportTicketType.toObject();
    supportTicketTypeResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    
    res.status(201).json({
      success: true,
      message: 'Support ticket type created successfully',
      data: supportTicketTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating support ticket type',
      error: error.message
    });
  }
};

// Update Support Ticket Type
const updateSupportTicketType = async (req, res) => {
  try {
    const { id, ...updateData } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Support Ticket Type ID is required in request body'
      });
    }

    const supportTicketType = await support_ticket_type.findOne({ support_ticket_type_id: parseInt(id) });
    if (!supportTicketType) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket type not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (key !== 'support_ticket_type_id') {
        supportTicketType[key] = updateData[key];
      }
    });

    supportTicketType.UpdatedBy = userId;
    supportTicketType.UpdatedAt = new Date();

    const updatedSupportTicketType = await supportTicketType.save();
    
    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      updatedSupportTicketType.CreateBy ? User.findOne({ user_id: updatedSupportTicketType.CreateBy }) : null,
      updatedSupportTicketType.UpdatedBy ? User.findOne({ user_id: updatedSupportTicketType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const supportTicketTypeResponse = updatedSupportTicketType.toObject();
    supportTicketTypeResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    supportTicketTypeResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;
    
    res.status(200).json({
      success: true,
      message: 'Support ticket type updated successfully',
      data: supportTicketTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating support ticket type',
      error: error.message
    });
  }
};

// Get Support Ticket Type by ID
const getSupportTicketTypeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supportTicketType = await support_ticket_type.findOne({ support_ticket_type_id: parseInt(id) });
    
    if (!supportTicketType) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket type not found'
      });
    }

    // Manually fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      supportTicketType.CreateBy ? User.findOne({ user_id: supportTicketType.CreateBy }) : null,
      supportTicketType.UpdatedBy ? User.findOne({ user_id: supportTicketType.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const supportTicketTypeResponse = supportTicketType.toObject();
    supportTicketTypeResponse.CreateBy = createByUser ? 
      { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
    supportTicketTypeResponse.UpdatedBy = updatedByUser ? 
      { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

    res.status(200).json({
      success: true,
      data: supportTicketTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket type',
      error: error.message
    });
  }
};

// Get All Support Ticket Types
const getAllSupportTicketTypes = async (req, res) => {
  try {
    const supportTicketTypes = await support_ticket_type.find({ Status: true }).sort({ CreateAt: -1 });

    // Manually fetch related data for all support ticket types
    const supportTicketTypesResponse = await Promise.all(supportTicketTypes.map(async (supportTicketType) => {
      const createByUser = supportTicketType.CreateBy ? 
        await User.findOne({ user_id: supportTicketType.CreateBy }) : null;

      const supportTicketTypeObj = supportTicketType.toObject();
      supportTicketTypeObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;

      return supportTicketTypeObj;
    }));

    res.status(200).json({
      success: true,
      count: supportTicketTypesResponse.length,
      data: supportTicketTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket types',
      error: error.message
    });
  }
};

// Get Support Ticket Type by Auth (current logged in user)
const getSupportTicketTypeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const supportTicketTypes = await support_ticket_type.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!supportTicketTypes || supportTicketTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket types not found for current user'
      });
    }

    // Manually fetch related data for all support ticket types
    const supportTicketTypesResponse = await Promise.all(supportTicketTypes.map(async (supportTicketType) => {
      const [createByUser, updatedByUser] = await Promise.all([
        supportTicketType.CreateBy ? User.findOne({ user_id: supportTicketType.CreateBy }) : null,
        supportTicketType.UpdatedBy ? User.findOne({ user_id: supportTicketType.UpdatedBy }) : null
      ]);

      const supportTicketTypeObj = supportTicketType.toObject();
      supportTicketTypeObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      supportTicketTypeObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return supportTicketTypeObj;
    }));

    res.status(200).json({
      success: true,
      count: supportTicketTypesResponse.length,
      data: supportTicketTypesResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching support ticket types',
      error: error.message
    });
  }
};

// Delete Support Ticket Type
const deleteSupportTicketType = async (req, res) => {
  try {
    const { id } = req.params;
    
    const supportTicketType = await support_ticket_type.findOne({ support_ticket_type_id: parseInt(id) });
    
    if (!supportTicketType) {
      return res.status(404).json({
        success: false,
        message: 'Support ticket type not found'
      });
    }

    await support_ticket_type.deleteOne({ support_ticket_type_id: parseInt(id) });
    
    res.status(200).json({
      success: true,
      message: 'Support ticket type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting support ticket type',
      error: error.message
    });
  }
};

module.exports = {
  createSupportTicketType,
  updateSupportTicketType,
  getSupportTicketTypeById,
  getAllSupportTicketTypes,
  getSupportTicketTypeByAuth,
  deleteSupportTicketType
};
