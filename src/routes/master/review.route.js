const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  createReview,
  updateReview,
  getReviewById,
  getAllReviews,
  getReviewsByReviewTypeId,
  getReviewByAuth,
  deleteReview
} = require('../../controllers/Review.Controller');
const {
  validateCreateReview,
  validateUpdateReview,
  handleValidationErrors
} = require('../../middleware/reviewValidation');

// Review routes
router.post('/create', auth, validateCreateReview, handleValidationErrors, createReview);
router.put('/update', auth, validateUpdateReview, handleValidationErrors, updateReview);
router.get('/get/:Review_id', auth, getReviewById);
router.get('/getall', getAllReviews);
router.get('/getbyreviewtypeid/:Review_Type_id', auth, getReviewsByReviewTypeId);
router.get('/getbyauth', auth, getReviewByAuth);
router.delete('/delete/:Review_id', auth, deleteReview);

module.exports = router;
