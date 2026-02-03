const express = require('express');
const router = express.Router();
const { auth } = require('../../middleware/authMiddleware');
const {
  createTransaction,
  updateTransaction,
  getTransactionById,
  getAllTransactions,
  getTransactionByAuth,
  deleteTransaction,
  getTransactionChart
} = require('../../controllers/Transaction.Controller');

// Create Transaction (with auth)
router.post('/create', auth, createTransaction);

// Update Transaction (with auth)
router.put('/update', auth, updateTransaction);

// Get Transaction by ID (with auth)
router.get('/getbyid/:id', auth, getTransactionById);

// Get all Transactions (with auth)
router.get('/getall', auth, getAllTransactions);

// Get Transaction by auth (with auth)
router.get('/getbyauth', auth, getTransactionByAuth);

// Delete Transaction (with auth)
router.delete('/delete/:id', auth, deleteTransaction);

// Get Transaction Chart (with auth)
router.get('/chart', auth, getTransactionChart);

module.exports = router;

