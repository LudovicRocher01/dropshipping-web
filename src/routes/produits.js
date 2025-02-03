const express = require('express');
const router = express.Router();
const db = require('../models/db');
const multer = require('multer');
const path = require('path');

// Configuration de multer pour stocker les images
const storage = multer.diskStorage({
    destination: "uploads/", // Dossier où seront stockées les images
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Génère un nom unique
    }
});
const upload = multer({ storage: storage });

// 🔹 Récupérer tous les produits
router.get('/', (req, res) => {
    db.query('SELECT * FROM produits', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
});

// 🔹 Ajouter un produit avec upload d’image
router.post('/', upload.single("image"), (req, res) => {
    const { nom, description, prix, lien_achat, categorie } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null; // Stocke l’URL de l’image

    if (!nom || !categorie || !image_url) {
        return res.status(400).json({ error: "Nom, image et catégorie obligatoires" });
    }

    const sql = 'INSERT INTO produits (nom, description, prix, lien_achat, image_url, categorie) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [nom, description, prix, lien_achat, image_url, categorie], (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout du produit:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ message: "Produit ajouté", id: result.insertId });
    });
});

// 🔹 Modifier un produit
router.put('/:id', upload.single("image"), (req, res) => {
    const { nom, description, prix, lien_achat, categorie } = req.body;
    const { id } = req.params;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url; // Garder l'image existante si non changée

    const sql = 'UPDATE produits SET nom=?, description=?, prix=?, lien_achat=?, image_url=?, categorie=? WHERE id=?';
    db.query(sql, [nom, description, prix, lien_achat, image_url, categorie, id], (err) => {
        if (err) {
            console.error('Erreur lors de la modification du produit:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: 'Produit mis à jour' });
    });
});

// 🔹 Supprimer un produit
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

// 🔹 Servir les images statiquement
router.use("/uploads", express.static("uploads"));

module.exports = router;
