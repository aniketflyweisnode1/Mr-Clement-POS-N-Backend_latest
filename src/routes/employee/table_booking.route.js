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

router.get('/getall', auth, getAllTables);
router.get('/getbyauth', auth, getTableByAuth);
router.get('/getTablebookingstates', auth, getAllTableBookingStatus);
router.get('/getTablebookingstatesbyauth', auth, getTableBookingStatusByAuthForBooking);

module.exports = router;
