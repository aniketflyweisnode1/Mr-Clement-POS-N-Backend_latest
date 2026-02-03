const Admin_MessageType = require('../models/Admin_MessageType.model');
const User = require('../models/User.model');

// Create Admin Message Type
const createAdminMessageType = async (req, res) => {
  try {
    const { MessageType, Status } = req.body;
    const userId = req.user.user_id;

    if (!MessageType) {
      return res.status(400).json({
        success: false,
        message: 'MessageType is required'
      });
    }

    const adminMessageType = new Admin_MessageType({
      MessageType,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedMessageType = await adminMessageType.save();

    // Fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: savedMessageType.CreateBy }),
      savedMessageType.UpdatedBy ? User.findOne({ user_id: savedMessageType.UpdatedBy }) : null
    ]);

    const messageTypeResponse = savedMessageType.toObject();
    messageTypeResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageTypeResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'Admin message type created successfully',
      data: messageTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin message type',
      error: error.message
    });
  }
};

// Update Admin Message Type
const updateAdminMessageType = async (req, res) => {
  try {
    const { id, MessageType, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin Message Type ID is required in request body'
      });
    }

    const adminMessageType = await Admin_MessageType.findOne({ 
      Admin_MassageType_id: parseInt(id) 
    });

    if (!adminMessageType) {
      return res.status(404).json({
        success: false,
        message: 'Admin message type not found'
      });
    }

    if (MessageType !== undefined) adminMessageType.MessageType = MessageType;
    if (Status !== undefined) adminMessageType.Status = Status;
    
    adminMessageType.UpdatedBy = userId;
    adminMessageType.UpdatedAt = new Date();

    const updatedMessageType = await adminMessageType.save();

    // Fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: updatedMessageType.CreateBy }),
      User.findOne({ user_id: updatedMessageType.UpdatedBy })
    ]);

    const messageTypeResponse = updatedMessageType.toObject();
    messageTypeResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageTypeResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Admin message type updated successfully',
      data: messageTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin message type',
      error: error.message
    });
  }
};

// Get Admin Message Type by ID
const getAdminMessageTypeById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminMessageType = await Admin_MessageType.findOne({ 
      Admin_MassageType_id: parseInt(id) 
    });

    if (!adminMessageType) {
      return res.status(404).json({
        success: false,
        message: 'Admin message type not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: adminMessageType.CreateBy }),
      adminMessageType.UpdatedBy ? User.findOne({ user_id: adminMessageType.UpdatedBy }) : null
    ]);

    const messageTypeResponse = adminMessageType.toObject();
    messageTypeResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageTypeResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      data: messageTypeResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin message type',
      error: error.message
    });
  }
};

// Get All Admin Message Types
const getAllAdminMessageTypes = async (req, res) => {
  try {
    const adminMessageTypes = await Admin_MessageType.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all message types
    const messageTypesWithData = await Promise.all(
      adminMessageTypes.map(async (messageType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: messageType.CreateBy }),
          messageType.UpdatedBy ? User.findOne({ user_id: messageType.UpdatedBy }) : null
        ]);

        const messageTypeResponse = messageType.toObject();
        messageTypeResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        messageTypeResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return messageTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: messageTypesWithData.length,
      data: messageTypesWithData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin message types',
      error: error.message
    });
  }
};

// Get Admin Message Type by Auth (current logged in user)
const getAdminMessageTypeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find message types created by the current user
    const adminMessageTypes = await Admin_MessageType.find({ 
      CreateBy: userId,
      Status: true 
    }).sort({ CreateAt: -1 });

    if (adminMessageTypes.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin message types found for current user'
      });
    }

    // Fetch related data for all message types
    const messageTypesWithData = await Promise.all(
      adminMessageTypes.map(async (messageType) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: messageType.CreateBy }),
          messageType.UpdatedBy ? User.findOne({ user_id: messageType.UpdatedBy }) : null
        ]);

        const messageTypeResponse = messageType.toObject();
        messageTypeResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        messageTypeResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return messageTypeResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: messageTypesWithData.length,
      data: messageTypesWithData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin message types',
      error: error.message
    });
  }
};

// Delete Admin Message Type
const deleteAdminMessageType = async (req, res) => {
  try {
    const { id } = req.params;

    const adminMessageType = await Admin_MessageType.findOne({ 
      Admin_MassageType_id: parseInt(id) 
    });

    if (!adminMessageType) {
      return res.status(404).json({
        success: false,
        message: 'Admin message type not found'
      });
    }

    await Admin_MessageType.deleteOne({ Admin_MassageType_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Admin message type deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin message type',
      error: error.message
    });
  }
};

module.exports = {
  createAdminMessageType,
  updateAdminMessageType,
  getAdminMessageTypeById,
  getAllAdminMessageTypes,
  getAdminMessageTypeByAuth,
  deleteAdminMessageType
};

