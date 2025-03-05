const express = require('express');
const router = express.Router();
const { getCommandes, deleteCommande } = require('../controllers/commandesController');
const { verifierAdmin } = require('../middlewares/authMiddleware');
const rateLimit = require('express-rate-limit');

const commandesLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 30,
    message: { error: "Trop de requêtes. Réessayez plus tard." }
});

router.get('/', verifierAdmin, commandesLimiter, getCommandes);
router.delete('/:id', verifierAdmin, commandesLimiter, deleteCommande);

module.exports = router;