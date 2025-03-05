const express = require('express');
const router = express.Router();
const { calculerTotalPanier } = require('../controllers/orderController');

router.post('/total', calculerTotalPanier);

module.exports = router;