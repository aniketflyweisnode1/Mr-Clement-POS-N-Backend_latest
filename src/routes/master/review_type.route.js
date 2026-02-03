const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  createReviewType,
  updateReviewType,
  getReviewTypeById,
  getAllReviewTypes,
  getReviewTypesByAuth,
  deleteReviewType
} = require('../../controllers/Review_Type.Controller');
const {
  validateCreateReviewType,
  validateUpdateReviewType,
  handleValidationErrors
} = require('../../middleware/reviewTypeValidation');

// Review Type routes
router.post('/create', auth, validateCreateReviewType, handleValidationErrors, createReviewType);
router.put('/update', auth, validateUpdateReviewType, handleValidationErrors, updateReviewType);
router.get('/get/:Review_type_id', auth, getReviewTypeById);
router.get('/getall', getAllReviewTypes);
router.get('/getbyauth', auth, getReviewTypesByAuth);
router.delete('/delete/:Review_type_id', auth, deleteReviewType);

module.exports = router;
