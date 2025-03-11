const express = require('express');
const router = express.Router();
const { envoyerConfirmationCommande, notifierVendeur, envoyerCodeAccesPDF, notifierPreinscription } = require('../controllers/mailController');

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

router.post('/send-pdf-code', async (req, res) => {
    try {
        const { email, accessCode } = req.body;
        await envoyerCodeAccesPDF(email, accessCode);
        res.json({ message: "Code PDF envoyé." });
    } catch (error) {
        console.error("Erreur lors de l'envoi du code PDF :", error);
        res.status(500).json({ error: "Échec de l'envoi du code PDF." });
    }
});

router.post('/inscription', async (req, res) => {
    try {
        const { nom, prenom, email, telephone, conference_id } = req.body;
        await notifierPreinscription(nom, prenom, email, telephone, conference_id);
        res.json({ message: "Email de pré-inscription envoyé." });
    } catch (error) {
        console.error("Erreur lors de l'envoi de l'email de pré-inscription :", error);
        res.status(500).json({ error: "Échec de l'envoi de l'email de pré-inscription." });
    }
});


module.exports = router;