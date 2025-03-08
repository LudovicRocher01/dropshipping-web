const db = require('../models/db');
const validator = require("validator");

exports.getProduits = (req, res) => {
    db.query('SELECT * FROM produits', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des produits:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
};

exports.addProduit = (req, res) => {
    const { nom, description, prix, lien_achat, categorie } = req.body;
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;

    if (!nom || !categorie || !image_url) {
        return res.status(400).json({ error: "Nom, image et catégorie obligatoires" });
    }

    if (!validator.isLength(nom, { min: 2, max: 100 })) {
        return res.status(400).json({ error: "Le nom du produit est trop court ou trop long." });
    }

    if (prix && (!validator.isFloat(prix.toString()) || prix <= 0)) {
        return res.status(400).json({ error: "Prix invalide." });
    }

    let sql, params;

    if (categorie === "conference") {
        sql = 'INSERT INTO produits (nom, description, image_url, categorie) VALUES (?, ?, ?, ?)';
        params = [nom, description, image_url, categorie];
    } else {
        sql = 'INSERT INTO produits (nom, description, lien_achat, prix, image_url, categorie) VALUES (?, ?, ?, ?, ?, ?)';
        params = [nom, description, lien_achat || null, prix || null, image_url, categorie];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout du produit:", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ message: "Produit ajouté", id: result.insertId });
    });
};


exports.updateProduit = (req, res) => {
    const { nom, description, prix, lien_achat } = req.body;
    const { id } = req.params;
    const image_url = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    if (!validator.isNumeric(id)) {
        return res.status(400).json({ error: "ID invalide." });
    }

    db.query('SELECT categorie FROM produits WHERE id = ?', [id], (err, results) => {
        if (err || results.length === 0) {
            console.error('Erreur lors de la récupération du produit:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }

        const categorie = results[0].categorie;
        let sql, params;

        if (categorie === 'conference') {
            sql = 'UPDATE produits SET nom=?, description=?, image_url=? WHERE id=?';
            params = [nom, description, image_url, id];
        } else {
            sql = 'UPDATE produits SET nom=?, description=?, prix=?, lien_achat=?, image_url=? WHERE id=?';
            params = [nom, description, prix || null, lien_achat || null, image_url, id];
        }

        db.query(sql, params, (err) => {
            if (err) {
                console.error('Erreur lors de la modification du produit:', err);
                return res.status(500).json({ error: 'Erreur serveur' });
            }
            res.json({ message: 'Produit mis à jour' });
        });
    });
};


exports.deleteProduit = (req, res) => {
    const { id } = req.params;

    if (!validator.isNumeric(id)) {
        return res.status(400).json({ error: "ID invalide." });
    }

    const sql = 'DELETE FROM produits WHERE id=?';
    db.query(sql, [id], (err) => {
        if (err) {
            console.error('Erreur lors de la suppression du produit:', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json({ message: 'Produit supprimé' });
    });
};