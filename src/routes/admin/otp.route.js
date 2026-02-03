const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  getOTPByUserId, 
  getAllOTPs, 
  getOTPsByStatus,
  getOTPByAuth
} = require('../../controllers/OTP.Controller');

// OTP routes for admin 29/08/2025
router.get('/getbyuserid/:user_id', auth, getOTPByUserId);
router.get('/getall', auth, getAllOTPs);
router.get('/getbystatus/:status', auth, getOTPsByStatus);
router.get('/getbyauth', auth, getOTPByAuth);

module.exports = router;
