const db = require('../models/db');
const validator = require("validator");
const { notifierPreinscription } = require("./mailController");

exports.getFormulaires = (req, res) => {
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
};

exports.getFormulairesByConference = (req, res) => {
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
};

exports.addFormulaire = (req, res) => {
    let { nom, prenom, email, telephone, conference_id } = req.body;

    if (!nom || !prenom || !email || !telephone || !conference_id) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Email invalide." });
    }

    if (!validator.isNumeric(telephone, { no_symbols: true }) || telephone.length < 8) {
        return res.status(400).json({ error: "Numéro de téléphone invalide." });
    }

    if (!validator.isInt(conference_id.toString())) {
        return res.status(400).json({ error: "ID de conférence invalide." });
    }

    if (!validator.isAlpha(nom, 'fr-FR', { ignore: " -" }) || !validator.isAlpha(prenom, 'fr-FR', { ignore: " -" })) {
        return res.status(400).json({ error: "Le nom et prénom ne doivent contenir que des lettres." });
    }

    const sql = `INSERT INTO formulaires (nom, prenom, email, telephone, conference_id) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [nom, prenom, email, telephone, conference_id], async (err, result) => {
        if (err) {
            console.error("Erreur lors de l'ajout de la pré-inscription :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        await notifierPreinscription(nom, prenom, email, telephone, conference_id);
        res.json({ message: "Pré-inscription enregistrée avec succès !" });
    });
};

exports.deleteFormulaire = (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM formulaires WHERE id = ?', [id], (err) => {
        if (err) {
            console.error("Erreur lors de la suppression :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }
        res.json({ message: "Pré-inscription supprimée." });
    });
};
