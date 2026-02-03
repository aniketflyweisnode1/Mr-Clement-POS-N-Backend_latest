const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateQuickOrder, validateUpdateQuickOrder, handleValidationErrors } = require('../../middleware/quickOrderValidation');
const { 
  createQuickOrder, 
  updateQuickOrder, 
  getQuickOrderById, 
  getAllQuickOrders,
  getQuickOrdersByAuth,
  getQuickOrdersByOrderStatus,
  getQuickOrdersByTableBookingStatus
} = require('../../controllers/Quick_Order.Controller');

// Quick Order routes
router.post('/create', auth, validateCreateQuickOrder, handleValidationErrors, createQuickOrder);
router.put('/update', auth, validateUpdateQuickOrder, handleValidationErrors, updateQuickOrder);
router.get('/get/:id', auth, getQuickOrderById);
router.get('/getall', getAllQuickOrders);
router.get('/getbyauth', auth, getQuickOrdersByAuth);
router.get('/getbystatus/:order_status', auth, getQuickOrdersByOrderStatus);
router.get('/getbytablebookingstatus/:table_booking_status_id', getQuickOrdersByTableBookingStatus);

module.exports = router;
