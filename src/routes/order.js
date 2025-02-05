// routes/order.js
const express = require('express');
const router = express.Router();
const db = require('../models/db'); // Assure-toi que ce chemin est correct

// Endpoint pour recalculer le total du panier
router.post('/total', (req, res) => {
  // Le client envoie un tableau de { id, quantite }
  const panier = req.body.panier;
  
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
      const shippingFee = 5;
      total += shippingFee;
      res.json({ total: total.toFixed(2) });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors du calcul du total' });
    });
});

module.exports = router;
