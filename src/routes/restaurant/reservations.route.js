const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  validateCreateReservation,
  validateUpdateReservation,
  handleValidationErrors
} = require('../../middleware/reservationsValidation');
const {
  createReservation,
  updateReservation,
  getReservationById,
  getAllReservations,
  getReservationsByAuth,
  deleteReservation,
  getReservationsWithFilter
} = require('../../controllers/Reservations.Controller');

// Create reservation (with auth)
router.post('/create', auth, validateCreateReservation, handleValidationErrors, createReservation);

// Update reservation (with auth)
router.put('/update', auth, validateUpdateReservation, handleValidationErrors, updateReservation);

// Get reservation by ID (with auth)
router.get('/getbyid/:id', auth, getReservationById);

// Get all reservations (with auth)
router.get('/getall', auth, getAllReservations);
// search filterAPI
router.get('/search', auth, getReservationsWithFilter);

// Get reservations by authenticated user (with auth)
router.get('/getbyauth', auth, getReservationsByAuth);

// Delete reservation (with auth)
router.delete('/delete/:id', auth, deleteReservation);

module.exports = router;
