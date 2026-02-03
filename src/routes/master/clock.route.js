const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createClock,
  updateClock,
  getClockById,
  getAllClocks,
  getClocksByUserId,
  getClockByAuth,
  deleteClock
} = require('../../controllers/Clock.Controller');

// Create clock record (with auth)
router.post('/create', auth, createClock);

// Update clock record (with auth)
router.put('/update', auth, updateClock);

// Get clock record by ID (with auth)
router.get('/get/:Clock_in_id', auth, getClockById);

// Get all clock records (with auth)
router.get('/all', auth, getAllClocks);

// Get clock records by user ID (with auth)
router.get('/userId/:user_id', auth, getClocksByUserId);

// Get clock records by auth (with auth)
router.get('/getbyauth', auth, getClockByAuth);

// Delete clock record (with auth)
router.delete('/delete/:Clock_in_id', auth, deleteClock);

module.exports = router;
