const express = require('express');
const router = express.Router();
const { envoyerConfirmationCommande, notifierVendeur } = require('../controllers/mailController');

// Route pour tester l'envoi d'un email de confirmation (exemple)
router.post('/confirm', async (req, res) => {
    try {
        const { client, produits, total, transactionId } = req.body;
        await envoyerConfirmationCommande(client, produits, total, transactionId);
        res.json({ message: "Email de confirmation envoyé." });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email :", error);
        res.status(500).json({ error: "Échec de l'envoi de l'email." });
    }
});

// Route pour tester l'envoi d'un email au vendeur (exemple)
router.post('/notify', async (req, res) => {
    try {
        const { client, produits, total, transactionId } = req.body;
        await notifierVendeur(client, produits, total, transactionId);
        res.json({ message: "Notification envoyée au vendeur." });
    } catch (error) {
        console.error("Erreur lors de l'envoi de la notification :", error);
        res.status(500).json({ error: "Échec de l'envoi de la notification." });
    }
});

module.exports = router;