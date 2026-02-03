const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  createFeedbackType,
  updateFeedbackType,
  getFeedbackTypeById,
  getAllFeedbackTypes,
  getFeedbackTypesByAuth,
  deleteFeedbackType
} = require('../../controllers/Feedback_Type.Controller');
const {
  validateCreateFeedbackType,
  validateUpdateFeedbackType,
  handleValidationErrors
} = require('../../middleware/feedbackTypeValidation');

// Feedback Type routes
router.post('/create', auth, validateCreateFeedbackType, handleValidationErrors, createFeedbackType);
router.put('/update', auth, validateUpdateFeedbackType, handleValidationErrors, updateFeedbackType);
router.get('/get/:feedback_type_id', auth, getFeedbackTypeById);
router.get('/getall', getAllFeedbackTypes);
router.get('/getbyauth', auth, getFeedbackTypesByAuth);
router.delete('/delete/:feedback_type_id', auth, deleteFeedbackType);

module.exports = router;
