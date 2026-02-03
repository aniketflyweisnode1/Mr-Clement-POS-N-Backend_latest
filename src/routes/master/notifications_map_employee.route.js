const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createNotificationsMapEmployee,
  updateNotificationsMapEmployee,
  getNotificationMapEmployeeById,
  getAllNotificationsMapEmployee,
  createNotificationsMapRoleId,
  getNotificationsMapEmployeeByAuth,
  deleteNotificationsMapEmployee
} = require('../../controllers/Notifications_Map_employee.Controller');

// Create notification mapping (with auth)
router.post('/create', auth, createNotificationsMapEmployee);

// Create notification mapping by role ID (with auth)
router.post('/createbyRoleid', auth, createNotificationsMapRoleId);

// Update notification mapping (with auth)
router.put('/update', auth, updateNotificationsMapEmployee);

// Get notification mapping by ID (with auth)
router.get('/get/:Notifications_Map_employee_id', auth, getNotificationMapEmployeeById);

// Get all notification mappings (with auth)
router.get('/all', auth, getAllNotificationsMapEmployee);

// Get notification mappings by auth (with auth)
router.get('/getbyauth', auth, getNotificationsMapEmployeeByAuth);

// Delete notification mapping (with auth)
router.delete('/delete/:Notifications_Map_employee_id', auth, deleteNotificationsMapEmployee);

module.exports = router;