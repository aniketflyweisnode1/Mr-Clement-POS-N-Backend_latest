const Notifications_Map_employee = require('../models/Notifications_Map_employee.model');
const Notifications = require('../models/Notifications.model');
const User = require('../models/User.model');
const Role = require('../models/Role.model');

// Create Notifications_Map_employee
const createNotificationsMapEmployee = async (req, res) => {
  try {
    const { Notifications_id, employee_id, isRead, Status } = req.body;
    const userId = req.user.user_id;

    // Validate that notification exists
    const notification = await Notifications.findOne({ Notifications_id });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    console.log(employee_id);
    // Validate that employee exists
    const employee = await User.findOne({ user_id: employee_id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    const notificationMap = new Notifications_Map_employee({
      Notifications_id,
      employee_id,
      isRead: isRead !== undefined ? isRead : false,
      Status: Status !== undefined ? Status : true,
      CreateBy: userId
    });

    const savedNotificationMap = await notificationMap.save();
    
    // Fetch related data
    const [notificationData, employeeData, createByUser] = await Promise.all([
      Notifications.findOne({ Notifications_id: savedNotificationMap.Notifications_id }),
      User.findOne({ user_id: savedNotificationMap.employee_id }),
      User.findOne({ user_id: savedNotificationMap.CreateBy })
    ]);

    // Create response object with populated data
    const notificationMapResponse = savedNotificationMap.toObject();
    notificationMapResponse.Notifications_id = notificationData ? {
      Notifications_id: notificationData.Notifications_id,
      Notifications: notificationData.Notifications,
      Status: notificationData.Status
    } : null;
    notificationMapResponse.employee_id = employeeData ? {
      user_id: employeeData.user_id,
      Name: employeeData.Name,
      email: employeeData.email,
      Employee_id: employeeData.Employee_id
    } : null;
    notificationMapResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;

    res.status(201).json({
      success: true,
      message: 'Notification mapping created successfully',
      data: notificationMapResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification mapping',
      error: error.message
    });
  }
};

// Update Notifications_Map_employee
const updateNotificationsMapEmployee = async (req, res) => {
  try {
    const { Notifications_Map_employee_id, Notifications_id, employee_id, isRead, Status } = req.body;
    const userId = req.user.user_id;

    const notificationMap = await Notifications_Map_employee.findOne({ Notifications_Map_employee_id });

    if (!notificationMap) {
      return res.status(404).json({
        success: false,
        message: 'Notification mapping not found'
      });
    }

    // Update fields
    if (Notifications_id !== undefined) notificationMap.Notifications_id = Notifications_id;
    if (employee_id !== undefined) notificationMap.employee_id = employee_id;
    if (isRead !== undefined) notificationMap.isRead = isRead;
    if (Status !== undefined) notificationMap.Status = Status;
    notificationMap.UpdatedBy = userId;
    notificationMap.UpdatedAt = new Date();

    const updatedNotificationMap = await notificationMap.save();
    
    // Fetch related data
    const [notificationData, employeeData, createByUser, updatedByUser] = await Promise.all([
      Notifications.findOne({ Notifications_id: updatedNotificationMap.Notifications_id }),
      User.findOne({ user_id: updatedNotificationMap.employee_id }),
      User.findOne({ user_id: updatedNotificationMap.CreateBy }),
      User.findOne({ user_id: updatedNotificationMap.UpdatedBy })
    ]);

    // Create response object with populated data
    const notificationMapResponse = updatedNotificationMap.toObject();
    notificationMapResponse.Notifications_id = notificationData ? {
      Notifications_id: notificationData.Notifications_id,
      Notifications: notificationData.Notifications,
      Status: notificationData.Status
    } : null;
    notificationMapResponse.employee_id = employeeData ? {
      user_id: employeeData.user_id,
      Name: employeeData.Name,
      email: employeeData.email,
      Employee_id: employeeData.Employee_id
    } : null;
    notificationMapResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    notificationMapResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Notification mapping updated successfully',
      data: notificationMapResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating notification mapping',
      error: error.message
    });
  }
};

// Get Notification_Map_employee by ID
const getNotificationMapEmployeeById = async (req, res) => {
  try {
    const { Notifications_Map_employee_id } = req.params;

    const notificationMap = await Notifications_Map_employee.findOne({ Notifications_Map_employee_id });

    if (!notificationMap) {
      return res.status(404).json({
        success: false,
        message: 'Notification mapping not found'
      });
    }

    // Fetch related data
    const [notificationData, employeeData, createByUser, updatedByUser] = await Promise.all([
      Notifications.findOne({ Notifications_id: notificationMap.Notifications_id }),
      User.findOne({ user_id: notificationMap.employee_id }),
      User.findOne({ user_id: notificationMap.CreateBy }),
      notificationMap.UpdatedBy ? User.findOne({ user_id: notificationMap.UpdatedBy }) : null
    ]);

    // Create response object with populated data
    const notificationMapResponse = notificationMap.toObject();
    notificationMapResponse.Notifications_id = notificationData ? {
      Notifications_id: notificationData.Notifications_id,
      Notifications: notificationData.Notifications,
      Status: notificationData.Status
    } : null;
    notificationMapResponse.employee_id = employeeData ? {
      user_id: employeeData.user_id,
      Name: employeeData.Name,
      email: employeeData.email,
      Employee_id: employeeData.Employee_id
    } : null;
    notificationMapResponse.CreateBy = createByUser ? {
      user_id: createByUser.user_id,
      Name: createByUser.Name,
      email: createByUser.email
    } : null;
    notificationMapResponse.UpdatedBy = updatedByUser ? {
      user_id: updatedByUser.user_id,
      Name: updatedByUser.Name,
      email: updatedByUser.email
    } : null;

    res.status(200).json({
      success: true,
      message: 'Notification mapping retrieved successfully',
      data: notificationMapResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving notification mapping',
      error: error.message
    });
  }
};

// Get All Notifications_Map_employee
const getAllNotificationsMapEmployee = async (req, res) => {
  try {
    const notificationMaps = await Notifications_Map_employee.find().sort({ CreateAt: -1 });

    // Fetch related data for all notification mappings
    const notificationMapsWithData = await Promise.all(
      notificationMaps.map(async (notificationMap) => {
        const [notificationData, employeeData, createByUser, updatedByUser] = await Promise.all([
          Notifications.findOne({ Notifications_id: notificationMap.Notifications_id }),
          User.findOne({ user_id: notificationMap.employee_id }),
          User.findOne({ user_id: notificationMap.CreateBy }),
          notificationMap.UpdatedBy ? User.findOne({ user_id: notificationMap.UpdatedBy }) : null
        ]);

        const notificationMapResponse = notificationMap.toObject();
        notificationMapResponse.Notifications_id = notificationData ? {
          Notifications_id: notificationData.Notifications_id,
          Notifications: notificationData.Notifications,
          Status: notificationData.Status
        } : null;
        notificationMapResponse.employee_id = employeeData ? {
          user_id: employeeData.user_id,
          Name: employeeData.Name,
          email: employeeData.email,
          Employee_id: employeeData.Employee_id
        } : null;
        notificationMapResponse.CreateBy = createByUser ? {
          user_id: createByUser.user_id,
          Name: createByUser.Name,
          email: createByUser.email
        } : null;
        notificationMapResponse.UpdatedBy = updatedByUser ? {
          user_id: updatedByUser.user_id,
          Name: updatedByUser.Name,
          email: updatedByUser.email
        } : null;

        return notificationMapResponse;
      })
    );

    res.status(200).json({
      success: true,
      message: 'Notification mappings retrieved successfully',
      data: notificationMapsWithData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error retrieving notification mappings',
      error: error.message
    });
  }
};

// Create Notifications_Map_employee by Role ID
const createNotificationsMapRoleId = async (req, res) => {
  try {
    const { Notifications_id, role_id, isRead, Status } = req.body;
    const userId = req.user.user_id;

    // Validate that notification exists
    const notification = await Notifications.findOne({ Notifications_id });
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Validate that role exists
    const role = await Role.findOne({ Role_id: role_id });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found'
      });
    }

    // Find all users with the specified role
    const usersWithRole = await User.find({ Role_id: role_id, Status: true });
    
    if (usersWithRole.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active users found with the specified role'
      });
    }

    // Create notification mappings for all users with the role
    const notificationMaps = [];
    for (const user of usersWithRole) {
      const notificationMap = new Notifications_Map_employee({
        Notifications_id,
        employee_id: user.user_id,
        isRead: isRead !== undefined ? isRead : false,
        Status: Status !== undefined ? Status : true,
        CreateBy: userId
      });
      notificationMaps.push(notificationMap);
    }

    // Save all notification mappings
    const savedNotificationMaps = await Notifications_Map_employee.insertMany(notificationMaps);
    
    // Fetch related data for the first mapping (for response structure)
    const [notificationData, createByUser] = await Promise.all([
      Notifications.findOne({ Notifications_id: savedNotificationMaps[0].Notifications_id }),
      User.findOne({ user_id: savedNotificationMaps[0].CreateBy })
    ]);

    // Create response object with populated data
    const responseData = {
      role: {
        Role_id: role.Role_id,
        role_name: role.role_name
      },
      notification: notificationData ? {
        Notifications_id: notificationData.Notifications_id,
        Notifications: notificationData.Notifications,
        Status: notificationData.Status
      } : null,
      createBy: createByUser ? {
        user_id: createByUser.user_id,
        Name: createByUser.Name,
        email: createByUser.email
      } : null,
      mappingsCreated: savedNotificationMaps.length,
      mappings: savedNotificationMaps.map(map => ({
        Notifications_Map_employee_id: map.Notifications_Map_employee_id,
        employee_id: map.employee_id,
        isRead: map.isRead,
        Status: map.Status,
        CreateAt: map.CreateAt
      }))
    };

    res.status(201).json({
      success: true,
      message: `Notification mapping created successfully for ${savedNotificationMaps.length} users with role: ${role.role_name}`,
      data: responseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating notification mapping by role',
      error: error.message
    });
  }
};

// Delete Notifications Map Employee
const deleteNotificationsMapEmployee = async (req, res) => {
  try {
    const { Notifications_Map_employee_id } = req.params;
    
    const notificationMap = await Notifications_Map_employee.findOne({ Notifications_Map_employee_id: parseInt(Notifications_Map_employee_id) });
    
    if (!notificationMap) {
      return res.status(404).json({
        success: false,
        message: 'Notification mapping not found'
      });
    }

    await Notifications_Map_employee.deleteOne({ Notifications_Map_employee_id: parseInt(Notifications_Map_employee_id) });
    
    res.status(200).json({
      success: true,
      message: 'Notification mapping deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting notification mapping',
      error: error.message
    });
  }
};

// Get Notifications Map Employee by Auth (current logged in user)
const getNotificationsMapEmployeeByAuth = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const notificationMaps = await Notifications_Map_employee.find({ CreateBy: userId, Status: true }).sort({ CreateAt: -1 });
    
    if (!notificationMaps || notificationMaps.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Notification mappings not found for current user'
      });
    }

    // Manually fetch related data for all notification mappings
    const notificationMapsResponse = await Promise.all(notificationMaps.map(async (notificationMap) => {
      const [createByUser, updatedByUser] = await Promise.all([
        notificationMap.CreateBy ? User.findOne({ user_id: notificationMap.CreateBy }) : null,
        notificationMap.UpdatedBy ? User.findOne({ user_id: notificationMap.UpdatedBy }) : null
      ]);

      const notificationMapObj = notificationMap.toObject();
      notificationMapObj.CreateBy = createByUser ? 
        { user_id: createByUser.user_id, Name: createByUser.Name, email: createByUser.email } : null;
      notificationMapObj.UpdatedBy = updatedByUser ? 
        { user_id: updatedByUser.user_id, Name: updatedByUser.Name, email: updatedByUser.email } : null;

      return notificationMapObj;
    }));

    res.status(200).json({
      success: true,
      count: notificationMapsResponse.length,
      data: notificationMapsResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching notification mappings',
      error: error.message
    });
  }
};

module.exports = {
  createNotificationsMapEmployee,
  updateNotificationsMapEmployee,
  getNotificationMapEmployeeById,
  getAllNotificationsMapEmployee,
  createNotificationsMapRoleId,
  getNotificationsMapEmployeeByAuth,
  deleteNotificationsMapEmployee
};