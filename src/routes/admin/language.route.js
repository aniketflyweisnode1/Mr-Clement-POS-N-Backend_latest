const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateLanguage, validateUpdateLanguage, handleValidationErrors } = require('../../middleware/languageValidation');
const { 
  createLanguage, 
  updateLanguage, 
  getLanguageById, 
  getAllLanguages,
  getLanguageByAuth,
  deleteLanguage
} = require('../../controllers/Language.Controller');

// Language routes
router.post('/create', auth, validateCreateLanguage, handleValidationErrors, createLanguage);
router.put('/update', auth, validateUpdateLanguage, handleValidationErrors, updateLanguage);
router.get('/get/:id', auth, getLanguageById);
router.get('/getall',  getAllLanguages);
router.get('/getbyauth', auth, getLanguageByAuth);
router.delete('/delete/:id', auth, deleteLanguage);

module.exports = router;
