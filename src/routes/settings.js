const express = require('express');
const router = express.Router();
const { verifierAdmin } = require('../routes/auth');
const { getSetting, updateSetting } = require('../controllers/settingsController');
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 20,
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." }
});

router.get('/:key', getSetting);
router.put('/:key', verifierAdmin, limiter, updateSetting);

module.exports = router;