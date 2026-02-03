const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createSupportTicketType,
  updateSupportTicketType,
  getSupportTicketTypeById,
  getAllSupportTicketTypes,
  getSupportTicketTypeByAuth,
  deleteSupportTicketType
} = require('../../controllers/support_ticket_type.Controller');

// Create support ticket type (with auth)
router.post('/create', auth, createSupportTicketType);

// Update support ticket type (with auth)
router.put('/update', auth, updateSupportTicketType);

// Get support ticket type by ID (with auth)
router.get('/getbyid/:id', auth, getSupportTicketTypeById);

// Get all support ticket types (with auth)
router.get('/getall', auth, getAllSupportTicketTypes);

// Get support ticket type by auth (with auth)
router.get('/getbyauth', auth, getSupportTicketTypeByAuth);

// Delete support ticket type (with auth)
router.delete('/delete/:id', auth, deleteSupportTicketType);

module.exports = router;
