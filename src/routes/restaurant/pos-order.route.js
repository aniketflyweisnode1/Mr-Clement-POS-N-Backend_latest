const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreatePosOrder,
  validateUpdatePosOrder,
  validateUpdatePosOrderStatus,
  validateUpdatePosOrderItemStatus,
  handleValidationErrors
} = require('../../middleware/posOrderValidation');
const {
  createPosOrder,
  updatePosOrder,
  getPosOrderById,
  getAllPosOrders,
  getPosOrdersByAuth,
  deletePosOrder,
  updatePosOrderItemStatus,
  updatePosOrderStatus,
  getCurrentOrderOnTableByTableId
} = require('../../controllers/Pos_Point_sales_Order.Controller');

// Create POS order (with auth)
router.post('/create', auth, validateCreatePosOrder, handleValidationErrors, createPosOrder);

// Update POS order (with auth)
router.put('/update', auth, validateUpdatePosOrder, handleValidationErrors, updatePosOrder);

// Update POS order status
router.patch('/update-status', auth, validateUpdatePosOrderStatus, handleValidationErrors, updatePosOrderStatus);

// Update POS order item status
router.patch('/update-item-status', auth, validateUpdatePosOrderItemStatus, handleValidationErrors, updatePosOrderItemStatus);

// Get POS order by ID (with auth)
router.get('/getbyid/:id', auth, getPosOrderById);

// Get all POS orders (with auth)
router.get('/getall', auth, getAllPosOrders);

// Get POS orders by authenticated user (with auth)
router.get('/my-orders', auth, getPosOrdersByAuth);

// Get current order on table by table ID (with auth)
router.get('/table/:tableId/current-order', auth, getCurrentOrderOnTableByTableId);

// Delete POS order (with auth)
router.delete('/delete/:id', auth, deletePosOrder);

module.exports = router;
