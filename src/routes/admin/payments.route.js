const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createPayment,
  updatePayment,
  getPaymentById,
  getAllPayments,
  getPaymentByAuth
} = require('../../controllers/Payments.Controller');

// Create payment (with auth)
router.post('/create', auth, createPayment);

// Update payment (with auth)
router.put('/update', auth, updatePayment);

// Get payment by ID (with auth)
router.get('/getbyid/:id', auth, getPaymentById);

// Get all payments (with auth)
router.get('/getall', auth, getAllPayments);

// Get payment by auth (with auth)
router.get('/getbyauth', auth, getPaymentByAuth);

module.exports = router;
