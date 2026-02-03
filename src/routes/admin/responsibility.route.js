const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateResponsibility, validateUpdateResponsibility, handleValidationErrors } = require('../../middleware/responsibilityValidation');
const { 
  createResponsibility, 
  updateResponsibility, 
  getResponsibilityById, 
  getAllResponsibilities,
  getResponsibilityByAuth,
  deleteResponsibility
} = require('../../controllers/Responsibility.Controller');

// Responsibility routes
router.post('/create', auth, validateCreateResponsibility, handleValidationErrors, createResponsibility);
router.put('/update', auth, validateUpdateResponsibility, handleValidationErrors, updateResponsibility);
router.get('/get/:id', auth, getResponsibilityById);
router.get('/getall',  getAllResponsibilities);
router.get('/getbyauth', auth, getResponsibilityByAuth);
router.delete('/delete/:id', auth, deleteResponsibility);

module.exports = router;
