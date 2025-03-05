const express = require('express');
const router = express.Router();
const { getFormulaires, getFormulairesByConference, addFormulaire, deleteFormulaire } = require('../controllers/formulairesController');
const { verifierAdmin } = require('../middlewares/authMiddleware');
const rateLimit = require("express-rate-limit");

const inscriptionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Trop de demandes. Réessayez plus tard." }
});

router.get('/', verifierAdmin, getFormulaires);
router.get('/:conference_id', verifierAdmin, getFormulairesByConference);
router.post('/', inscriptionLimiter, addFormulaire);
router.delete('/:id', verifierAdmin, deleteFormulaire);

module.exports = router;