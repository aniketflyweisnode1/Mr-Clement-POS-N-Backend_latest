const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { validateCreateState, validateUpdateState, handleValidationErrors } = require('../../middleware/stateValidation');
const { 
  createState, 
  updateState, 
  getStateById, 
  getAllStates,
  getStatesByCountry,
  getStateByAuth,
  deleteState
} = require('../../controllers/State.Controller');

// State routes
router.post('/create', auth, validateCreateState, handleValidationErrors, createState);
router.put('/update', auth, validateUpdateState, handleValidationErrors, updateState);
router.get('/get/:id', auth, getStateById);
router.get('/getall', getAllStates);
router.get('/getbycountry/:countryId', auth, getStatesByCountry);
router.get('/getbyauth', auth, getStateByAuth);
router.delete('/delete/:id', auth, deleteState);

module.exports = router;
