const User = require('../models/User.model');
const User_Preferences = require('../models/User_Preferences.model');
const Notifications_Map_employee = require('../models/Notifications_Map_employee.model');
const Notifications = require('../models/Notifications.model');

// --- Employee Settings ---

const getEmployeeProfile = async (req, res) => {
  try {
    const user = await User.findOne({ user_id: req.user.user_id })
      .populate('Role_id', 'Role_id role_name')
      .select('-password');
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "Employee profile retrieved successfully", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployeeProfile = async (req, res) => {
  try {
    const { Name, phone, email } = req.body;
    const userId = req.user.user_id;

    const updateData = {};
    if (Name) updateData.Name = Name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;
    updateData.UpdatedBy = userId;
    updateData.UpdatedAt = new Date();

    const updatedUser = await User.findOneAndUpdate(
      { user_id: userId },
      updateData,
      { new: true }
    ).select('-password');

    res.status(200).json({ success: true, message: "Employee profile updated successfully", data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeePreferences = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    let prefs = await User_Preferences.findOne({ user_id: userId });
    
    if (!prefs) {
      // Return defaults if no preferences set
      return res.status(200).json({
        success: true,
        message: "Employee preferences retrieved successfully",
        data: {
          user_id: userId,
          language: "en",
          theme: "light",
          notifications: { email: true, push: true, sms: false },
          dashboard_layout: "compact",
          quick_actions: []
        }
      });
    }

    res.status(200).json({ success: true, message: "Employee preferences retrieved successfully", data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateEmployeePreferences = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { language, theme, notifications, dashboard_layout, quick_actions } = req.body;

    const updateData = {
      user_id: userId,
      language,
      theme,
      notifications,
      dashboard_layout,
      quick_actions,
      UpdatedAt: new Date()
    };

    const prefs = await User_Preferences.findOneAndUpdate(
      { user_id: userId },
      updateData,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ success: true, message: "Employee preferences updated successfully", data: prefs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getEmployeeNotifications = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const notificationMaps = await Notifications_Map_employee.find({ 
      employee_id: userId, 
      Status: true 
    }).sort({ CreateAt: -1 });

    if (!notificationMaps || notificationMaps.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Employee notifications retrieved successfully",
        data: []
      });
    }

    const notificationsResponse = await Promise.all(notificationMaps.map(async (map) => {
      const notification = await Notifications.findOne({ Notifications_id: map.Notifications_id });
      return {
        notification_id: map.Notifications_Map_employee_id,
        title: "Notification",
        message: notification ? notification.Notifications : "Message unavailable",
        type: "general",
        is_read: map.isRead,
        created_at: map.CreateAt
      };
    }));

    res.status(200).json({ 
      success: true, 
      message: "Employee notifications retrieved successfully", 
      data: notificationsResponse 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    const { notification_id } = req.params;
    const userId = req.user.user_id;

    const notificationMap = await Notifications_Map_employee.findOneAndUpdate(
      { Notifications_Map_employee_id: parseInt(notification_id), employee_id: userId },
      { isRead: true, UpdatedAt: new Date() },
      { new: true }
    );

    if (!notificationMap) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const result = await Notifications_Map_employee.updateMany(
      { employee_id: userId, isRead: false },
      { isRead: true, UpdatedAt: new Date() }
    );

    res.status(200).json({ 
      success: true, 
      message: "All notifications marked as read",
      data: { marked_count: result.modifiedCount || result.nModified || 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEmployeeProfile,
  updateEmployeeProfile,
  getEmployeePreferences,
  updateEmployeePreferences,
  getEmployeeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};