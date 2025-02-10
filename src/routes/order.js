// routes/order.js
const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Assurez-vous que ce chemin est correct

// Endpoint pour recalculer le total du panier
router.post('/total', (req, res) => {
  const { panier, retraitMagasin } = req.body;  // On récupère l'option de retrait

  if (!panier || !Array.isArray(panier)) {
    return res.status(400).json({ error: 'Données du panier invalides' });
  }

  let total = 0;
  let queries = panier.map(item => {
    return new Promise((resolve, reject) => {
      db.query('SELECT prix FROM produits WHERE id = ?', [item.id], (err, results) => {
        if (err) return reject(err);
        if (results.length > 0) {
          const prix = parseFloat(results[0].prix);
          total += prix * item.quantite;
        }
        resolve();
      });
    });
  });

  Promise.all(queries)
    .then(() => {
      if (retraitMagasin) {
        // Si l'utilisateur choisit le retrait, pas de frais de port
        res.json({ total: total.toFixed(2) });
      } else {
        // Sinon, on ajoute les frais de port
        db.query('SELECT setting_value FROM settings WHERE setting_key = ?', ['shipping_fee'], (err, results) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Erreur lors du calcul des frais de port' });
          }

          let shippingFee = 5; // Valeur par défaut
          if (results.length > 0) {
            shippingFee = parseFloat(results[0].setting_value);
            if (isNaN(shippingFee)) {
              shippingFee = 5;
            }
          }

          total += shippingFee;
          res.json({ total: total.toFixed(2) });
        });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors du calcul du total' });
    });
});

module.exports = router;
