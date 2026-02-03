const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateInvoice,
  validateUpdateInvoice,
  handleValidationErrors
} = require('../../middleware/invoicesValidation');
const {
  createInvoice,
  updateInvoice,
  getInvoiceById,
  getAllInvoices,
  getInvoicesByAuth,
  deleteInvoice
} = require('../../controllers/Invoices.Controller');

// Create invoice (with auth)
router.post('/create', auth, validateCreateInvoice, handleValidationErrors, createInvoice);

// Update invoice (with auth)
router.put('/update', auth, validateUpdateInvoice, handleValidationErrors, updateInvoice);

// Get invoice by ID (with auth)
router.get('/getbyid/:id', auth, getInvoiceById);

// Get all invoices (with auth)
router.get('/getall', auth, getAllInvoices);

// Get invoices by authenticated user (with auth)
router.get('/getbyauth', auth, getInvoicesByAuth);

// Delete invoice (with auth)
router.delete('/delete/:id', auth, deleteInvoice);

module.exports = router;
