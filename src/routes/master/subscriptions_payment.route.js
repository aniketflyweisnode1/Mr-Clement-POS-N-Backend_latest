const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createSubscriptionsPayment,
  updateSubscriptionsPayment,
  getSubscriptionsPaymentById,
  getAllSubscriptionsPayments,
  getSubscriptionsPaymentsByAuth,
  getSubscriptionsPaymentsByPlanMapClientId
} = require('../../controllers/Subscriptions_Payment.Controller');

// Create subscription payment (with auth)
router.post('/create', auth, createSubscriptionsPayment);

// Update subscription payment (with auth)
router.put('/update', auth, updateSubscriptionsPayment);

// Get subscription payment by ID (with auth)
router.get('/getbyid/:id', auth, getSubscriptionsPaymentById);

// Get all subscription payments (with auth)
router.get('/getall', auth, getAllSubscriptionsPayments);

// Get subscription payments by auth (current logged in user) (with auth)
router.get('/getbyauth', auth, getSubscriptionsPaymentsByAuth);

// Get subscription payments by Plan_map_Client_id (with auth)
router.get('/getbyplanmapclientid/:planMapClientId', auth, getSubscriptionsPaymentsByPlanMapClientId);

module.exports = router;

