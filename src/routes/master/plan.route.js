const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createPlan,
  updatePlan,
  getPlanById,
  getAllPlans,
  getPlanByAuth
} = require('../../controllers/Plan.Controller');

// Create plan (with auth)
router.post('/create', auth, createPlan);

// Update plan (with auth)
router.put('/update', auth, updatePlan);

// Get plan by ID (with auth)
router.get('/getbyid/:id', auth, getPlanById);

// Get all plans (with auth)
router.get('/getall', getAllPlans);
router.get('/getall', getAllPlans);

// Get plan by auth (with auth)
router.get('/getbyauth', auth, getPlanByAuth);

module.exports = router;
