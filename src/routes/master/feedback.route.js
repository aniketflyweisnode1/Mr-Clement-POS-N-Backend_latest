const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  createFeedback,
  updateFeedback,
  getFeedbackById,
  getAllFeedbacks,
  getFeedbackByOrderId,
  getFeedbackByAuth,
  deleteFeedback
} = require('../../controllers/Feedback.Controller');
const {
  validateCreateFeedback,
  validateUpdateFeedback,
  handleValidationErrors
} = require('../../middleware/feedbackValidation');

// Feedback routes
router.post('/create', auth, validateCreateFeedback, handleValidationErrors, createFeedback);
router.put('/update', auth, validateUpdateFeedback, handleValidationErrors, updateFeedback);
router.get('/get/:feedback_id', auth, getFeedbackById);
router.get('/getall', getAllFeedbacks);
router.get('/getbyorderid/:order_id', getFeedbackByOrderId);
router.get('/getbyauth', auth, getFeedbackByAuth);
router.delete('/delete/:feedback_id', auth, deleteFeedback);

module.exports = router;
