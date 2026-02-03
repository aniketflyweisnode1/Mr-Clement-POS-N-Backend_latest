const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const { 
  getRestaurantEmployeeByRole,
  getEmployeeById,
  getEmployeesByRoleId
} = require('../../controllers/User.Controller.js');

// Get employees by role ID (filtered by authenticated restaurant)
router.get('/role/:roleId', auth, getEmployeesByRoleId);

// Get employees by restaurant ID and role ID
router.get('/restaurant/:restaurantId/role/:roleId', auth, getRestaurantEmployeeByRole);

// Get employee by ID
router.get('/:id', auth, getEmployeeById);

module.exports = router;

