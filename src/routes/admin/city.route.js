const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateCity, validateUpdateCity, handleValidationErrors } = require('../../middleware/cityValidation');
const { 
  createCity, 
  updateCity, 
  getCityById, 
  getAllCities,
  getCityByAuth,
  deleteCity,
  getCitiesByState
} = require('../../controllers/City.Controller');

// City routes
router.post('/create', auth, validateCreateCity, handleValidationErrors, createCity);
router.put('/update', auth, validateUpdateCity, handleValidationErrors, updateCity);
router.get('/bystate/:stateId', getCitiesByState);
router.get('/get/:id', auth, getCityById);
router.get('/getall', getAllCities);
router.get('/getbyauth', auth, getCityByAuth);
router.delete('/delete/:id', auth, deleteCity);

module.exports = router;
