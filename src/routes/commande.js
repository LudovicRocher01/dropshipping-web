// routes/commande.js
const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Assurez-vous que le chemin est correct

// Endpoint pour enregistrer une commande
router.post('/submit', (req, res) => {
  const { client, produits, total, transactionId } = req.body;

  if (!client || !produits || !total || !transactionId) {
    return res.status(400).json({ error: 'Données de commande incomplètes' });
  }

  // Pour cet exemple, nous stockons la commande dans une table "commandes"
  // Assurez-vous d'avoir créé la table dans votre base de données (exemple ci-dessous)
  const sql = `
    INSERT INTO commandes 
    (prenom, nom, email, adresse, telephone, total, transaction_id, order_details) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // On stocke les détails de la commande (liste des produits) en JSON
  const orderDetails = JSON.stringify(produits);
  const values = [
    client.prenom,
    client.nom,
    client.email,
    client.adresse,
    client.telephone,
    total,
    transactionId,
    orderDetails
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'enregistrement de la commande:", err);
      return res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de la commande' });
    }
    res.json({ message: 'Commande enregistrée avec succès', orderId: result.insertId });
  });
});

module.exports = router;
