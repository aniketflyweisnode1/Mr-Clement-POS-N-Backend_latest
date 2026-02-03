const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createPaymentType,
  updatePaymentType,
  getPaymentTypeById,
  getAllPaymentTypes,
  getPaymentTypeByAuth,
  deletePaymentType
} = require('../../controllers/payment_type.Controller');

// Create payment type (with auth)
router.post('/create', auth, createPaymentType);

// Update payment type (with auth)
router.put('/update', auth, updatePaymentType);

// Get payment type by ID (with auth)
router.get('/getbyid/:id', auth, getPaymentTypeById);

// Get all payment types (with auth)
router.get('/getall', auth, getAllPaymentTypes);

// Get payment type by auth (with auth)
router.get('/getbyauth', auth, getPaymentTypeByAuth);

// Delete payment type (with auth)
router.delete('/delete/:id', auth, deletePaymentType);

module.exports = router;
