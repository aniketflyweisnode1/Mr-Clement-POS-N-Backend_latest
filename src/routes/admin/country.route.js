const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateCountry, validateUpdateCountry, handleValidationErrors } = require('../../middleware/countryValidation');
const { 
  createCountry, 
  updateCountry, 
  getCountryById, 
  getAllCountries,
  getCountryByAuth,
  deleteCountry
} = require('../../controllers/Country.Controller');

// Country routes
router.post('/create', auth, validateCreateCountry, handleValidationErrors, createCountry);
router.put('/update', auth, validateUpdateCountry, handleValidationErrors, updateCountry);
router.get('/get/:id', auth, getCountryById);
router.get('/getall',  getAllCountries);
router.get('/getbyauth', auth, getCountryByAuth);
router.delete('/delete/:id', auth, deleteCountry);

module.exports = router;
