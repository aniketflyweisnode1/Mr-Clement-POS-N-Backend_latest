const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  getRestaurantEmployeeByRole,
  getEmployeeById,
  getEmployeesByRoleId,
  getUserByAuth: getEmployeeProfile,
  updateUser: updateEmployeeProfile,
  getEmployeeWorkSummaryReport
} = require('../../controllers/User.Controller.js');
const { changePassword: changeEmployeePassword } = require('../../controllers/Auth.Controller.js');
const { 
  getEmployeePreferences, 
  updateEmployeePreferences,
  getEmployeeNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} = require('../../controllers/Employee.Controller.js');

// Employee Profile Management
router.get('/profile', auth, getEmployeeProfile);
router.put('/profile/update', auth, updateEmployeeProfile);
router.put('/profile/change-password', auth, changeEmployeePassword);

// Get employees by role ID (filtered by authenticated restaurant)
router.get('/role/:roleId', auth, getEmployeesByRoleId);

// Get employees by restaurant ID and role ID
router.get('/restaurant/:restaurantId/role/:roleId', auth, getRestaurantEmployeeByRole);

// Employee Preferences
router.get('/preferences', auth, getEmployeePreferences);
router.put('/preferences', auth, updateEmployeePreferences);

// Employee Notifications
router.get('/notifications', auth, getEmployeeNotifications);
router.put('/notifications/mark-all-read', auth, markAllNotificationsAsRead);
router.put('/notifications/:notification_id/read', auth, markNotificationAsRead);

// Get employee by ID
router.get('/:id', auth, getEmployeeById);

// Get employee work summary report
router.get('/work-summary/:employeeId', auth, getEmployeeWorkSummaryReport);

module.exports = router;

