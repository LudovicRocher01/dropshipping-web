// routes/commandes.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Récupérer toutes les commandes
router.get('/', (req, res) => {
    db.query('SELECT * FROM commandes', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des commandes :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

// Supprimer (archiver) une commande en fonction de son ID
router.delete('/:id', (req, res) => {
    const commandeId = req.params.id;
    db.query('DELETE FROM commandes WHERE id = ?', [commandeId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la suppression de la commande :", err);
            return res.status(500).json({ error: "Erreur serveur lors de la suppression de la commande" });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }
        res.json({ message: "Commande archivée avec succès" });
    });
});

module.exports = router;
