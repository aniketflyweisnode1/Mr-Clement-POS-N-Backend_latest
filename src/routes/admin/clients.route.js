const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createClient,
  activeInactiveClient,
  updateClient,
  getClientById,
  getAllClients,
  getClientByAuth
} = require('../../controllers/Clients.Controller');

// Create client (with auth)
router.post('/create', auth, createClient);

// Active/Inactive client status (with auth)
router.put('/activeinactive', auth, activeInactiveClient);

// Update client (with auth)
router.put('/update', auth, updateClient);

// Get client by ID (with auth)
router.get('/getbyid/:id', auth, getClientById);

// Get all clients (with auth)
router.get('/getall', auth, getAllClients);

// Get client by auth (with auth)
router.get('/getbyauth', auth, getClientByAuth);


module.exports = router;
