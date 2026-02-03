const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createEmployeeFeedback,
  getEmployeeFeedback
} = require('../../controllers/Employee_Feedback.Controller');

// Create Employee Feedback (with auth)
router.post('/create', auth, createEmployeeFeedback);

// Get Employee Feedback (with auth)
router.get('/getall', auth, getEmployeeFeedback);

module.exports = router;

