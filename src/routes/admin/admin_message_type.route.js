const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createAdminMessageType,
  updateAdminMessageType,
  getAdminMessageTypeById,
  getAllAdminMessageTypes,
  getAdminMessageTypeByAuth,
  deleteAdminMessageType
} = require('../../controllers/Admin_MessageType.Controller');

// Create Admin Message Type (with auth)
router.post('/create', auth, createAdminMessageType);

// Update Admin Message Type (with auth)
router.put('/update', auth, updateAdminMessageType);

// Get Admin Message Type by ID (with auth)
router.get('/getbyid/:id', auth, getAdminMessageTypeById);

// Get all Admin Message Types (with auth)
router.get('/getall', auth, getAllAdminMessageTypes);

// Get Admin Message Type by auth (with auth)
router.get('/getbyauth', auth, getAdminMessageTypeByAuth);

// Delete Admin Message Type (with auth)
router.delete('/delete/:id', auth, deleteAdminMessageType);

module.exports = router;

