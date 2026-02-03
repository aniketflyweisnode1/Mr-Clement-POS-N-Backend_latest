const Admin_Message_with_client = require('../models/Admin_Message_with_client.model');
const Admin_Message = require('../models/Admin_Message.model');
const User = require('../models/User.model');

// Create Admin Message with Client
const createAdminMessageWithClient = async (req, res) => {
  try {
    const { user_id, message_id, Message, SubscriptionDetails, date, time, IsRead } = req.body;
    const userId = req.user.user_id;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      });
    }

    if (!message_id) {
      return res.status(400).json({
        success: false,
        message: 'message_id is required'
      });
    }

    // Verify user exists
    const user = await User.findOne({ user_id: parseInt(user_id) });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify Admin_Message exists
    const adminMessage = await Admin_Message.findOne({ 
      Admin_Message_id: parseInt(message_id) 
    });
    if (!adminMessage) {
      return res.status(404).json({
        success: false,
        message: 'Admin Message not found'
      });
    }

    // Use message data if not provided
    const finalMessage = Message || adminMessage.Message;
    const finalSubscriptionDetails = SubscriptionDetails || adminMessage.SubscriptionDetails;

    // Get current time if not provided
    const currentTime = new Date();
    const timeString = time || currentTime.toTimeString().split(' ')[0];

    const adminMessageWithClient = new Admin_Message_with_client({
      user_id: parseInt(user_id),
      message_id: parseInt(message_id),
      Message: finalMessage,
      SubscriptionDetails: finalSubscriptionDetails,
      date: date ? new Date(date) : currentTime,
      time: timeString,
      IsRead: IsRead !== undefined ? IsRead : false,
      Status: true,
      CreateBy: userId
    });

    const savedMessageWithClient = await adminMessageWithClient.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData, messageData] = await Promise.all([
      User.findOne({ user_id: savedMessageWithClient.CreateBy }),
      savedMessageWithClient.UpdatedBy ? User.findOne({ user_id: savedMessageWithClient.UpdatedBy }) : null,
      User.findOne({ user_id: savedMessageWithClient.user_id }),
      Admin_Message.findOne({ Admin_Message_id: savedMessageWithClient.message_id })
    ]);

    const messageWithClientResponse = savedMessageWithClient.toObject();
    messageWithClientResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageWithClientResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    messageWithClientResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    messageWithClientResponse.message_id = messageData ? {
      Admin_Message_id: messageData.Admin_Message_id,
      Message: messageData.Message,
      SchuduleDate: messageData.SchuduleDate
    } : null;

    res.status(201).json({
      success: true,
      message: 'Admin message with client created successfully',
      data: messageWithClientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating admin message with client',
      error: error.message
    });
  }
};

// Update Admin Message with Client
const updateAdminMessageWithClient = async (req, res) => {
  try {
    const { id, Message, SubscriptionDetails, date, time, IsRead, Status } = req.body;
    const userId = req.user.user_id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Admin Message with Client ID is required in request body'
      });
    }

    const adminMessageWithClient = await Admin_Message_with_client.findOne({ 
      Admin_Message_with_client_id: parseInt(id) 
    });

    if (!adminMessageWithClient) {
      return res.status(404).json({
        success: false,
        message: 'Admin message with client not found'
      });
    }

    if (Message !== undefined) adminMessageWithClient.Message = Message;
    if (SubscriptionDetails !== undefined) adminMessageWithClient.SubscriptionDetails = SubscriptionDetails;
    if (date !== undefined) adminMessageWithClient.date = new Date(date);
    if (time !== undefined) adminMessageWithClient.time = time;
    if (IsRead !== undefined) adminMessageWithClient.IsRead = IsRead;
    if (Status !== undefined) adminMessageWithClient.Status = Status;
    
    adminMessageWithClient.UpdatedBy = userId;
    adminMessageWithClient.UpdatedAt = new Date();

    const updatedMessageWithClient = await adminMessageWithClient.save();

    // Fetch related data
    const [createByUser, updatedByUser, userData, messageData] = await Promise.all([
      User.findOne({ user_id: updatedMessageWithClient.CreateBy }),
      User.findOne({ user_id: updatedMessageWithClient.UpdatedBy }),
      User.findOne({ user_id: updatedMessageWithClient.user_id }),
      Admin_Message.findOne({ Admin_Message_id: updatedMessageWithClient.message_id })
    ]);

    const messageWithClientResponse = updatedMessageWithClient.toObject();
    messageWithClientResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageWithClientResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    messageWithClientResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    messageWithClientResponse.message_id = messageData ? {
      Admin_Message_id: messageData.Admin_Message_id,
      Message: messageData.Message,
      SchuduleDate: messageData.SchuduleDate
    } : null;

    res.status(200).json({
      success: true,
      message: 'Admin message with client updated successfully',
      data: messageWithClientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating admin message with client',
      error: error.message
    });
  }
};

// Get Admin Message with Client by ID
const getAdminMessageWithClientById = async (req, res) => {
  try {
    const { id } = req.params;

    const adminMessageWithClient = await Admin_Message_with_client.findOne({ 
      Admin_Message_with_client_id: parseInt(id) 
    });

    if (!adminMessageWithClient) {
      return res.status(404).json({
        success: false,
        message: 'Admin message with client not found'
      });
    }

    // Fetch related data
    const [createByUser, updatedByUser, userData, messageData] = await Promise.all([
      User.findOne({ user_id: adminMessageWithClient.CreateBy }),
      adminMessageWithClient.UpdatedBy ? User.findOne({ user_id: adminMessageWithClient.UpdatedBy }) : null,
      User.findOne({ user_id: adminMessageWithClient.user_id }),
      Admin_Message.findOne({ Admin_Message_id: adminMessageWithClient.message_id })
    ]);

    const messageWithClientResponse = adminMessageWithClient.toObject();
    messageWithClientResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    messageWithClientResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;
    messageWithClientResponse.user_id = userData ? {
      user_id: userData.user_id,
      Name: userData.Name,
      email: userData.email
    } : null;
    messageWithClientResponse.message_id = messageData ? {
      Admin_Message_id: messageData.Admin_Message_id,
      Message: messageData.Message,
      SchuduleDate: messageData.SchuduleDate
    } : null;

    res.status(200).json({
      success: true,
      data: messageWithClientResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin message with client',
      error: error.message
    });
  }
};

// Get All Admin Messages with Client
const getAllAdminMessagesWithClient = async (req, res) => {
  try {
    const adminMessagesWithClient = await Admin_Message_with_client.find({ Status: true })
      .sort({ CreateAt: -1 });

    // Fetch related data for all messages
    const messagesWithData = await Promise.all(
      adminMessagesWithClient.map(async (messageWithClient) => {
        const [createByUser, updatedByUser, userData, messageData] = await Promise.all([
          User.findOne({ user_id: messageWithClient.CreateBy }),
          messageWithClient.UpdatedBy ? User.findOne({ user_id: messageWithClient.UpdatedBy }) : null,
          User.findOne({ user_id: messageWithClient.user_id }),
          Admin_Message.findOne({ Admin_Message_id: messageWithClient.message_id })
        ]);

        const messageWithClientResponse = messageWithClient.toObject();
        messageWithClientResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        messageWithClientResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        messageWithClientResponse.user_id = userData ? {
          user_id: userData.user_id,
          Name: userData.Name,
          email: userData.email
        } : null;
        messageWithClientResponse.message_id = messageData ? {
          Admin_Message_id: messageData.Admin_Message_id,
          Message: messageData.Message,
          SchuduleDate: messageData.SchuduleDate
        } : null;

        return messageWithClientResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: messagesWithData.length,
      data: messagesWithData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin messages with client',
      error: error.message
    });
  }
};

// Get Admin Message with Client by Auth (current logged in user)
const getAdminMessageWithClientByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Find messages for the current user
    const adminMessagesWithClient = await Admin_Message_with_client.find({ 
      user_id: userId,
      Status: true 
    }).sort({ CreateAt: -1 });

    if (adminMessagesWithClient.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No admin messages with client found for current user'
      });
    }

    // Fetch related data for all messages
    const messagesWithData = await Promise.all(
      adminMessagesWithClient.map(async (messageWithClient) => {
        const [createByUser, updatedByUser, messageData] = await Promise.all([
          User.findOne({ user_id: messageWithClient.CreateBy }),
          messageWithClient.UpdatedBy ? User.findOne({ user_id: messageWithClient.UpdatedBy }) : null,
          Admin_Message.findOne({ Admin_Message_id: messageWithClient.message_id })
        ]);

        const messageWithClientResponse = messageWithClient.toObject();
        messageWithClientResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        messageWithClientResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;
        messageWithClientResponse.message_id = messageData ? {
          Admin_Message_id: messageData.Admin_Message_id,
          Message: messageData.Message,
          SchuduleDate: messageData.SchuduleDate
        } : null;

        return messageWithClientResponse;
      })
    );

    res.status(200).json({
      success: true,
      count: messagesWithData.length,
      data: messagesWithData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin messages with client',
      error: error.message
    });
  }
};

// Delete Admin Message with Client
const deleteAdminMessageWithClient = async (req, res) => {
  try {
    const { id } = req.params;

    const adminMessageWithClient = await Admin_Message_with_client.findOne({ 
      Admin_Message_with_client_id: parseInt(id) 
    });

    if (!adminMessageWithClient) {
      return res.status(404).json({
        success: false,
        message: 'Admin message with client not found'
      });
    }

    await Admin_Message_with_client.deleteOne({ Admin_Message_with_client_id: parseInt(id) });

    res.status(200).json({
      success: true,
      message: 'Admin message with client deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting admin message with client',
      error: error.message
    });
  }
};

// Get Count by Message ID
const getCountByMassageId = async (req, res) => {
  try {
    const { messageId } = req.params;
    const parsedMessageId = parseInt(messageId);

    if (!messageId || isNaN(parsedMessageId)) {
      return res.status(400).json({
        success: false,
        message: 'Valid message ID is required'
      });
    }

    // Verify message exists
    const adminMessage = await Admin_Message.findOne({ 
      Admin_Message_id: parsedMessageId 
    });

    if (!adminMessage) {
      return res.status(404).json({
        success: false,
        message: 'Admin message not found'
      });
    }

    // Count messages with client for this message ID
    const totalCount = await Admin_Message_with_client.countDocuments({
      message_id: parsedMessageId,
      Status: true
    });

    const readCount = await Admin_Message_with_client.countDocuments({
      message_id: parsedMessageId,
      IsRead: true,
      Status: true
    });

    const unreadCount = await Admin_Message_with_client.countDocuments({
      message_id: parsedMessageId,
      IsRead: false,
      Status: true
    });

    res.status(200).json({
      success: true,
      message: 'Count retrieved successfully',
      message_id: parsedMessageId,
      counts: {
        total: totalCount,
        read: readCount,
        unread: unreadCount
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching count by message ID',
      error: error.message
    });
  }
};

module.exports = {
  createAdminMessageWithClient,
  updateAdminMessageWithClient,
  getAdminMessageWithClientById,
  getAllAdminMessagesWithClient,
  getAdminMessageWithClientByAuth,
  deleteAdminMessageWithClient,
  getCountByMassageId
};

