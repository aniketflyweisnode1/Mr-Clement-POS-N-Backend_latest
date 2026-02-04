const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
    getAllTables,
    getTableByAuth
} = require('../../controllers/Table.Controller');
const {
    getAllTableBookingStatus,
    getTableBookingStatusByAuthForBooking
} = require('../../controllers/Table-Booking-Status.Controller');
const {
    createTableBooking,
    updateTableBooking,
    getTableBookings
} = require('../../controllers/TableBooking.Controller');
const {
    validateCreateTableBooking,
    validateUpdateTableBooking,
    validateGetTableBookings,
    handleValidationErrors
} = require('../../middleware/tableBookingValidation');

router.get('/getall', auth, getAllTables);
router.get('/getbyauth', auth, getTableByAuth);
router.get('/getTablebookingstates', auth, getAllTableBookingStatus);
router.get('/getTablebookingstatesbyauth', auth, getTableBookingStatusByAuthForBooking);

// Table booking routes
router.post('/create', auth, validateCreateTableBooking, handleValidationErrors, createTableBooking);
router.put('/update', auth, validateUpdateTableBooking, handleValidationErrors, updateTableBooking);
router.get('/bookings', auth, validateGetTableBookings, handleValidationErrors, getTableBookings);

module.exports = router;
