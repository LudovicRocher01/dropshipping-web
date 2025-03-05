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

        // Insérer la commande
        const sqlCommande = `
            INSERT INTO commandes (prenom, nom, email, adresse, telephone, total, transaction_id, order_details) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sqlCommande, [client.prenom, client.nom, client.email, adresseFinale, telephone, total, transactionId, orderDetails], (err, result) => {
            if (err) {
                console.error("Erreur lors de l'enregistrement de la commande :", err);
                return res.status(500).json({ error: "Erreur serveur lors de l'enregistrement de la commande" });
            }

            const orderId = result.insertId; // Récupérer l'ID de la commande insérée
            let erreursStock = [];

            produits.forEach((item, index) => {
                db.query('SELECT quantite, prix FROM produits WHERE id = ?', [item.id], (err, results) => {
                    if (err) {
                        console.error(`Erreur serveur lors de la vérification du stock pour ${item.nom} :`, err);
                        erreursStock.push(`Erreur interne pour ${item.nom}`);
                        return;
                    }

                    if (results.length === 0 || results[0].quantite < item.quantite) {
                        erreursStock.push(`Stock insuffisant pour ${item.nom}`);
                    }

                    if (parseFloat(results[0].prix) !== parseFloat(item.prix)) {
                        erreursStock.push(`Prix modifié pour ${item.nom}. Veuillez rafraîchir la page.`);
                    }

                    if (erreursStock.length === 0) {
                        // Mettre à jour le stock
                        db.query('UPDATE produits SET quantite = quantite - ? WHERE id = ?', [item.quantite, item.id], (err) => {
                            if (err) {
                                console.error(`Erreur lors de la mise à jour du stock pour ${item.nom} :`, err);
                            }
                        });

                        // Si c'est le dernier produit, envoyer les emails au client et au vendeur
                        if (index === produits.length - 1) {
                            Promise.all([
                                envoyerConfirmationCommande(client, produits, total, transactionId),
                                notifierVendeur(client, produits, total, transactionId)
                            ])
                                .then(() => {
                                    res.json({ message: "Commande enregistrée et stock mis à jour", orderId });
                                })
                                .catch((emailErr) => {
                                    console.error("Erreur lors de l'envoi des emails :", emailErr);
                                    res.status(500).json({ error: "Commande enregistrée mais échec de l'envoi des emails" });
                                });
                        }
                    } else {
                        res.status(400).json({ error: erreursStock.join(", ") });
                    }
                });
            });
        });
    } catch (error) {
        console.error("Erreur lors du traitement de la commande :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
