const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Récupérer toutes les pré-inscriptions
router.get('/', (req, res) => {
    db.query(`
        SELECT f.*, p.nom AS conference_nom
        FROM formulaires f
        JOIN produits p ON f.conference_id = p.id
        ORDER BY f.date_inscription DESC
    `, (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des pré-inscriptions :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json(results);
    });
});

// Récupérer les pré-inscriptions pour une conférence spécifique
router.get('/:conference_id', (req, res) => {
    const { conference_id } = req.params;
    db.query(
        `SELECT * FROM formulaires WHERE conference_id = ? ORDER BY date_inscription DESC`,
        [conference_id],
        (err, results) => {
            if (err) {
                console.error("Erreur lors de la récupération des pré-inscriptions :", err);
                return res.status(500).json({ error: "Erreur serveur" });
            }
            res.json(results);
        }
    );
});

// Ajouter une pré-inscription
router.post('/', (req, res) => {
    const { nom, prenom, email, telephone, conference_id } = req.body;

    if (!nom || !prenom || !email || !telephone || !conference_id) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    const sql = `INSERT INTO formulaires (nom, prenom, email, telephone, conference_id) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [nom, prenom, email, telephone, conference_id], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout de la pré-inscription :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ message: "Pré-inscription enregistrée avec succès !" });
    });
});

// Supprimer une pré-inscription
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM formulaires WHERE id = ?', [id], (err) => {
        if (err) {
            console.error("Erreur lors de la suppression :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ message: "Pré-inscription supprimée." });
    });
});

module.exports = router;
