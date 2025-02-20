// routes/commande.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { envoyerConfirmationCommande } = require('./mailer');

router.post('/submit', (req, res) => {
  const { client, produits, total, transactionId } = req.body;

  if (!client || !produits || !total || !transactionId) {
    return res.status(400).json({ error: 'Données de commande incomplètes' });
  }

  // Étape 1: Vérification de la disponibilité des produits
  let stockCheckPromises = produits.map(item => {
    return new Promise((resolve, reject) => {
      db.query('SELECT quantite FROM produits WHERE id = ?', [item.id], (err, results) => {
        if (err) return reject('Erreur serveur lors de la vérification du stock.');
        if (results.length === 0) return reject(`Produit avec ID ${item.id} non trouvé.`);
        
        const stockDisponible = results[0].quantite;
        if (stockDisponible < item.quantite) {
          return reject(`Stock insuffisant pour le produit : ${item.nom}. Quantité disponible : ${stockDisponible}`);
        }
        resolve();
      });
    });
  });

  Promise.all(stockCheckPromises)
    .then(() => {
      // Étape 2: Enregistrer la commande dans la base de données
      const adresseFinale = client.adresse === "Retrait au cabinet" ? "Retrait au cabinet" : client.adresse;
      const sql = `
        INSERT INTO commandes 
        (prenom, nom, email, adresse, telephone, total, transaction_id, order_details) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const orderDetails = JSON.stringify(produits);
      const telephone = client.telephone && client.telephone !== "NULL" ? client.telephone : "Non renseigné";

      const values = [
        client.prenom,
        client.nom,
        client.email,
        adresseFinale,
        telephone,
        total,
        transactionId,
        orderDetails
      ];

      db.query(sql, values, (err, result) => {
        if (err) {
          console.error("Erreur lors de l'enregistrement de la commande:", err);
          return res.status(500).json({ error: 'Erreur serveur lors de l\'enregistrement de la commande' });
        }

        // Étape 3: Déduire le stock de manière sécurisée
        let updateStockPromises = produits.map(item => {
          return new Promise((resolve, reject) => {
            db.query('UPDATE produits SET quantite = quantite - ? WHERE id = ? AND quantite >= ?', [item.quantite, item.id, item.quantite], (err, result) => {
              if (err) return reject('Erreur lors de la mise à jour du stock.');
              if (result.affectedRows === 0) return reject(`Le stock a changé et n'est plus suffisant pour : ${item.nom}.`);
              resolve();
            });
          });
        });

        Promise.all(updateStockPromises)
          .then(() => {
            // Étape 4: Envoyer la confirmation de commande par mail
            envoyerConfirmationCommande(client, produits, total)
              .then(() => {
                console.log('Email de confirmation envoyé à', client.email);
                res.json({ message: 'Commande enregistrée avec succès et stock mis à jour.', orderId: result.insertId });
              })
              .catch(emailErr => {
                console.error('Erreur lors de l’envoi de l’email :', emailErr);
                res.status(500).json({ error: 'Commande enregistrée mais échec de l’envoi de l’email' });
              });
          })
          .catch(stockErr => {
            console.error('Erreur lors de la mise à jour des stocks :', stockErr);
            res.status(400).json({ error: stockErr });
          });
      });
    })
    .catch(err => {
      console.error('Erreur de stock :', err);
      res.status(400).json({ error: err });
    });
});

module.exports = router;
