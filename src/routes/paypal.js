const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/paypalController');

router.post('/order', createOrder);

module.exports = router;