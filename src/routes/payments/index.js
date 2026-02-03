const express = require('express');
const router = express.Router();

// Import payment routes
const triaxxPaymentRoutes = require('./triaxx-payment.route');

// Register payment routes
router.use('', triaxxPaymentRoutes);

module.exports = router;
