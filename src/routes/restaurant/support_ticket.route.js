const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateSupportTicket,
  validateUpdateSupportTicket,
  handleValidationErrors
} = require('../../middleware/supportTicketValidation');
const {
  createSupportTicket,
  updateSupportTicket,
  getSupportTicketById,
  getAllSupportTickets,
  getSupportTicketByAuth,
  deleteSupportTicket,
  getTicketsChart
} = require('../../controllers/support_ticket.Controller');

// Create support ticket (with auth)
router.post('/create', auth, validateCreateSupportTicket, handleValidationErrors, createSupportTicket);

// Update support ticket (with auth)
router.put('/update', auth, validateUpdateSupportTicket, handleValidationErrors, updateSupportTicket);

// Get support ticket by ID (with auth)
router.get('/getbyid/:id', auth, getSupportTicketById);

// Get all support tickets (with auth)
router.get('/getall', auth, getAllSupportTickets);

// Get support tickets by authenticated user (with auth)
router.get('/getbyauth', auth, getSupportTicketByAuth);

// Delete support ticket (with auth)
router.delete('/delete/:id', auth, deleteSupportTicket);

// Get Tickets Chart (with auth)
router.get('/chart', auth, getTicketsChart);

module.exports = router;
