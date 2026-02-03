const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateTableBookingStatus, validateUpdateTableBookingStatus, handleValidationErrors } = require('../../middleware/tableBookingStatusValidation');
const { 
  createTableBookingStatus, 
  updateTableBookingStatus, 
  getTableBookingStatusById, 
  getAllTableBookingStatus,
  getTableBookingStatusByAuth,
  deleteTableBookingStatus
} = require('../../controllers/Table-Booking-Status.Controller');

// Table-Booking-Status routes 29/08/2025
router.post('/create', auth, validateCreateTableBookingStatus, handleValidationErrors, createTableBookingStatus);
router.put('/update', auth, validateUpdateTableBookingStatus, handleValidationErrors, updateTableBookingStatus);
router.get('/get/:id', auth, getTableBookingStatusById);
router.get('/getall', getAllTableBookingStatus);
router.get('/getbyauth', auth, getTableBookingStatusByAuth);
router.delete('/delete/:id', auth, deleteTableBookingStatus);

module.exports = router;
