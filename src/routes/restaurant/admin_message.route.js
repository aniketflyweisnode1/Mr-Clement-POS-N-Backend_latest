const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createAdminMessage,
  updateAdminMessage,
  getAdminMessageById,
  getAllAdminMessages,
  getAdminMessageByAuth,
  deleteAdminMessage,
  get7DayRenewalMessages
} = require('../../controllers/Admin_Message.Controller');

// Create Admin Message (with auth)
router.post('/create', auth, createAdminMessage);

// Update Admin Message (with auth)
router.put('/update', auth, updateAdminMessage);

// Get Admin Message by ID (with auth)
router.get('/getbyid/:id', auth, getAdminMessageById);

// Get all Admin Messages (with auth)
router.get('/getall', auth, getAllAdminMessages);

// Get Admin Message by auth (with auth)
router.get('/getbyauth', auth, getAdminMessageByAuth);

// Delete Admin Message (with auth)
router.delete('/delete/:id', auth, deleteAdminMessage);

// Get 7 Day Renewal Messages for Plans (with auth)
router.get('/7day-renewal-messages', auth, get7DayRenewalMessages);

module.exports = router;

