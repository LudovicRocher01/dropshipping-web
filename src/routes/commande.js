const express = require('express');
const router = express.Router();
const { submitCommande } = require('../controllers/commandeController');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Trop de tentatives de commande, veuillez réessayer plus tard." }
});

router.post('/submit', limiter, submitCommande);

module.exports = router;