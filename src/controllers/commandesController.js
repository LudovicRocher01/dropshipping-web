const db = require('../models/db');

exports.getCommandes = (req, res) => {
    db.query('SELECT id, transaction_id, nom, prenom, email, adresse, total, order_details, created_at FROM commandes', (err, results) => {
        if (err) {
            console.error('Erreur lors de la récupération des commandes :', err);
            return res.status(500).json({ error: 'Erreur serveur' });
        }
        res.json(results);
    });
};

exports.deleteCommande = (req, res) => {
    const commandeId = req.params.id;
    if (!/^\d+$/.test(commandeId)) {
        return res.status(400).json({ error: "ID invalide." });
    }

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
};