const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Récupérer les produits
router.get('/', (req, res) => {
    db.query('SELECT * FROM produits', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

// Ajouter un produit
router.post('/', upload.single("image"), (req, res) => {
    const { nom, description, prix, lien_achat, categorie, quantite } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nom || !categorie || !image_url) {
        return res.status(400).json({ error: "Nom, image et catégorie obligatoires" });
    }

    let sql, params;

    if (categorie === "spray") {
        if (!quantite || isNaN(quantite)) {
            return res.status(400).json({ error: "Quantité requise pour les sprays" });
        }
        sql = 'INSERT INTO produits (nom, description, prix, image_url, categorie, quantite) VALUES (?, ?, ?, ?, ?, ?)';
        params = [nom, description, prix, image_url, categorie, parseInt(quantite)];
    } else {
        sql = 'INSERT INTO produits (nom, description, prix, lien_achat, image_url, categorie) VALUES (?, ?, ?, ?, ?, ?)';
        params = [nom, description, prix, lien_achat, image_url, categorie];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout du produit:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ message: "Produit ajouté", id: result.insertId });
    });
});


// Modifier un produit
router.put('/:id', upload.single("image"), (req, res) => {
    const { nom, description, prix, lien_achat, quantite } = req.body;
    const { id } = req.params;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    db.query('SELECT categorie FROM produits WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            console.error('Erreur lors de la récupération du produit:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        const categorie = results[0].categorie;
        let sql, params;

        if (categorie === 'spray') {
            sql = 'UPDATE produits SET nom=?, description=?, prix=?, image_url=?, quantite=? WHERE id=?';
            params = [nom, description, prix, image_url, quantite, id];
        } else {
            sql = 'UPDATE produits SET nom=?, description=?, prix=?, lien_achat=?, image_url=? WHERE id=?';
            params = [nom, description, prix, lien_achat, image_url, id];
        }

        db.query(sql, params, (err) => {
            if (err) {
                console.error('Erreur lors de la modification du produit:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            res.json({ message: 'Produit mis à jour' });
        });
    });
});


// Supprimer un produit
router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM produits WHERE id=?';
    db.query(sql, [id], (err) => {
        if (err) {
            console.error('Erreur lors de la suppression du produit:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: 'Produit supprimé' });
    });
});

router.use("/uploads", express.static("uploads"));

module.exports = router;
