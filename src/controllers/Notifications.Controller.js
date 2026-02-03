const Notifications = require('../models/Notifications.model');
const User = require('../models/User.model');

// Create Notifications
const createNotifications = async (req, res) => {
  try {
    const { Notifications: notificationText, Status } = req.body;
    const userId = req.user.user_id;

    const notification = new Notifications({
      Notifications: notificationText,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedNotification = await notification.save();
    
    // Fetch creator details
    const createByUser = await User.findOne({ user_id: savedNotification.CreateBy });

    // Create response object with populated data
    const notificationResponse = savedNotification.toObject();
    notificationResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: notificationResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// Update Notifications
const updateNotifications = async (req, res) => {
  try {
    const { Notifications_id, Notifications: notificationText, Status } = req.body;
    const userId = req.user.user_id;

    const notification = await Notifications.findOne({ Notifications_id });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Update fields
    if (notificationText !== undefined) notification.Notifications = notificationText;
    if (Status !== undefined) notification.Status = Status;
    notification.UpdatedBy = userId;
    notification.UpdatedAt = new Date();

    const updatedNotification = await notification.save();
    
    // Fetch creator and updater details
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: updatedNotification.CreateBy }),
      User.findOne({ user_id: updatedNotification.UpdatedBy })
    ]);

    // Create response object with populated data
    const notificationResponse = updatedNotification.toObject();
    notificationResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;
    notificationResponse.UpdatedBy = updatedByUser ? { 
      user_id: updatedByUser.user_id, 
      Name: updatedByUser.Name, 
      email: updatedByUser.email 
    } : null;

    res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      data: notificationResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification',
      error: error.message
    });
  }
};

// Get Notification by ID
const getNotificationById = async (req, res) => {
  try {
    const { Notifications_id } = req.params;

    const notification = await Notifications.findOne({ Notifications_id });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Fetch creator and updater details
    const [createByUser, updatedByUser] = await Promise.all([
      User.findOne({ user_id: notification.CreateBy }),
      notification.UpdatedBy ? User.findOne({ user_id: notification.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const notificationResponse = notification.toObject();
    notificationResponse.CreateBy = createByUser ? { 
      user_id: createByUser.user_id, 
      Name: createByUser.Name, 
      email: createByUser.email 
    } : null;
    notificationResponse.UpdatedBy = updatedByUser ? { 
      user_id: updatedByUser.user_id, 
      Name: updatedByUser.Name, 
      email: updatedByUser.email 
    } : null;

    res.status(200).json({
      success: true,
      message: 'Notification retrieved successfully',
      data: notificationResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving notification',
      error: error.message
    });
  }
};

// Get All Notifications
const getAllNotifications = async (req, res) => {
  try {
    const notifications = await Notifications.find({ Status: true }).sort({ CreateAt: -1 });

    // Fetch creator and updater details for all notifications
    const notificationsWithUsers = await Promise.all(
      notifications.map(async (notification) => {
        const [createByUser, updatedByUser] = await Promise.all([
          User.findOne({ user_id: notification.CreateBy }),
          notification.UpdatedBy ? User.findOne({ user_id: notification.UpdatedBy }) : null
        ]);

        const notificationResponse = notification.toObject();
        notificationResponse.CreateBy = createByUser ? { 
          user_id: createByUser.user_id, 
          Name: createByUser.Name, 
          email: createByUser.email 
        } : null;
        notificationResponse.UpdatedBy = updatedByUser ? { 
          user_id: updatedByUser.user_id, 
          Name: updatedByUser.Name, 
          email: updatedByUser.email 
        } : null;

        return notificationResponse;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: notificationsWithUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving notifications',
      error: error.message
    });
  }
};

// Delete Notification
const deleteNotification = async (req, res) => {
  try {
    const { Notifications_id } = req.params;
    
    const notification = await Notifications.findOne({ Notifications_id });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await Notifications.deleteOne({ Notifications_id });
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// Get Notifications by Auth (current logged in user)
const getNotificationsByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const notifications = await Notifications.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!notifications || notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notifications not found for current user'
      });
    }

    // Manually fetch related data for all notifications
    const notificationsResponse = await Promise.all(notifications.map(async (notification) => {
      const [createByUser, updatedByUser] = await Promise.all([
        notification.CreateBy ? User.findOne({ user_id: notification.CreateBy }) : null,
        notification.UpdatedBy ? User.findOne({ user_id: notification.UpdatedBy }) : null
      ]);

      const notificationObj = notification.toObject();
      notificationObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      notificationObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return notificationObj;
    }));

    res.status(200).json({
      success: true,
      count: notificationsResponse.length,
      data: notificationsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

module.exports = {
  createNotifications,
  updateNotifications,
  getNotificationById,
  getAllNotifications,
  getNotificationsByAuth,
  deleteNotification
};



