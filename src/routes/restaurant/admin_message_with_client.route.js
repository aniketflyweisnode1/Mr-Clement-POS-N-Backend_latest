const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createAdminMessageWithClient,
  updateAdminMessageWithClient,
  getAdminMessageWithClientById,
  getAllAdminMessagesWithClient,
  getAdminMessageWithClientByAuth,
  deleteAdminMessageWithClient,
  getCountByMassageId
} = require('../../controllers/Admin_Message_with_client.Controller');

// Create Admin Message with Client (with auth)
router.post('/create', auth, createAdminMessageWithClient);

// Update Admin Message with Client (with auth)
router.put('/update', auth, updateAdminMessageWithClient);

// Get Admin Message with Client by ID (with auth)
router.get('/getbyid/:id', auth, getAdminMessageWithClientById);

// Get all Admin Messages with Client (with auth)
router.get('/getall', auth, getAllAdminMessagesWithClient);

// Get Admin Message with Client by auth (with auth)
router.get('/getbyauth', auth, getAdminMessageWithClientByAuth);

// Delete Admin Message with Client (with auth)
router.delete('/delete/:id', auth, deleteAdminMessageWithClient);

// Get Count by Message ID (with auth)
router.get('/getcountbyMassageId/:messageId', auth, getCountByMassageId);

module.exports = router;

