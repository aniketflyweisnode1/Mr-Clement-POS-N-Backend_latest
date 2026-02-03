const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateSupportTicketReply,
  validateUpdateSupportTicketReply,
  handleValidationErrors
} = require('../../middleware/supportTicketReplyValidation');
const {
  createSupportTicketReply,
  updateSupportTicketReply,
  getSupportTicketReplyById,
  getAllSupportTicketReplies,
  getSupportTicketReplyByAuth,
  deleteSupportTicketReply
} = require('../../controllers/support_ticket_reply.Controller');

// Create support ticket reply (with auth)
router.post('/create', auth, validateCreateSupportTicketReply, handleValidationErrors, createSupportTicketReply);

// Update support ticket reply (with auth)
router.put('/update', auth, validateUpdateSupportTicketReply, handleValidationErrors, updateSupportTicketReply);

// Get support ticket reply by ID (with auth)
router.get('/getbyid/:id', auth, getSupportTicketReplyById);

// Get all support ticket replies (with auth)
router.get('/getall', auth, getAllSupportTicketReplies);

// Get support ticket replies by authenticated user (with auth)
router.get('/getbyauth', auth, getSupportTicketReplyByAuth);

// Delete support ticket reply (with auth)
router.delete('/delete/:id', auth, deleteSupportTicketReply);

module.exports = router;
