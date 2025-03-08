const db = require('../models/db');
const { envoyerConfirmationCommande, notifierVendeur } = require('../controllers/mailController');
const validator = require('validator');

exports.submitCommande = async (req, res) => {
    try {
        const { client, produits, transactionId } = req.body;
        const total = parseFloat(req.body.total);

        if (!client || !produits || !total || !transactionId) {
            return res.status(400).json({ error: 'Données de commande incomplètes' });
        }

        if (!validator.isEmail(client.email) || !validator.isNumeric(total.toString()) || !Array.isArray(produits) || produits.length === 0) {
            return res.status(400).json({ error: 'Données invalides' });
        }

        const adresseFinale = client.adresse === "Retrait au cabinet" ? "Retrait au cabinet" : client.adresse;
        const orderDetails = JSON.stringify(produits);
        const telephone = client.telephone || "Non renseigné";

        const sqlCommande = `
            INSERT INTO commandes (prenom, nom, email, adresse, telephone, total, transaction_id, order_details) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sqlCommande, [client.prenom, client.nom, client.email, adresseFinale, telephone, total, transactionId, orderDetails], async (err, result) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement de la commande :", err);
                return res.status(500).json({ error: "Erreur serveur lors de l'enregistrement de la commande" });
            }

            const orderId = result.insertId;

            try {
                await Promise.all([
                    envoyerConfirmationCommande(client, produits, total, transactionId),
                    notifierVendeur(client, produits, total, transactionId)
                ]);
                res.json({ message: "Commande enregistrée avec succès", orderId });
            } catch (emailErr) {
                console.error("Erreur lors de l'envoi des emails :", emailErr);
                res.status(500).json({ error: "Commande enregistrée mais échec de l'envoi des emails" });
            }
        });

    } catch (error) {
        console.error("Erreur lors du traitement de la commande :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};