const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createNotifications,
  updateNotifications,
  getNotificationById,
  getAllNotifications,
  getNotificationsByAuth,
  deleteNotification
} = require('../../controllers/Notifications.Controller');

// Create notification (with auth)
router.post('/create', auth, createNotifications);

// Update notification (with auth)
router.put('/update', auth, updateNotifications);

// Get notification by ID (with auth)
router.get('/get/:Notifications_id', auth, getNotificationById);

// Get all notifications (with auth)
router.get('/all', auth, getAllNotifications);

// Get notifications by auth (with auth)
router.get('/getbyauth', auth, getNotificationsByAuth);

// Delete notification (with auth)
router.delete('/delete/:Notifications_id', auth, deleteNotification);

module.exports = router;
