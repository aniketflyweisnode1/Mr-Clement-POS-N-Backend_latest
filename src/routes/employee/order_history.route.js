const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  getOrderHistory,
  getOrderHistoryByDateRange,
  getOrderHistoryByStatus,
  getOrderHistoryByTable,
  getOrderHistoryByClientMobileNo,
  getOrderHistoryByEmployeeId,
  getOrderHistoryByAuth,
  getWeeklyOrdersSummary
} = require('../../controllers/Order_History.Controller');

// Order History routes
router.get('/getall', auth, getOrderHistory);
router.get('/getbydaterange', auth, getOrderHistoryByDateRange);
router.get('/getbystatus/:order_status', auth, getOrderHistoryByStatus);
router.get('/getbytable/:table_id', auth, getOrderHistoryByTable);
router.get('/getbyclientmobile/:mobile_no', auth, getOrderHistoryByClientMobileNo);
router.get('/getbyemployeeid/:employee_id', auth, getOrderHistoryByEmployeeId);
router.get('/getbyauth', auth, getOrderHistoryByAuth);
router.get('/weeklysummary', auth, getWeeklyOrdersSummary);

module.exports = router;
