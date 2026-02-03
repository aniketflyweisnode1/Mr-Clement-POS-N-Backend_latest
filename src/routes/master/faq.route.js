const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createFaq,
  updateFaq,
  getFaqById,
  getAllFaqs,
  getFaqByAuth,
  deleteFaq
} = require('../../controllers/Faq.Controller');

// Create FAQ (with auth)
router.post('/create', auth, createFaq);

// Update FAQ (with auth)
router.put('/update', auth, updateFaq);

// Get FAQ by ID (with auth)
router.get('/get/:faq_in_id', auth, getFaqById);

// Get all FAQs (with auth)
router.get('/all', auth, getAllFaqs);

// Get FAQ by auth (with auth)
router.get('/getbyauth', auth, getFaqByAuth);

// Delete FAQ (with auth)
router.delete('/delete/:faq_in_id', auth, deleteFaq);

module.exports = router;
