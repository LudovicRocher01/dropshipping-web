const db = require('../models/db');

/**
 * 🔹 Récupérer un paramètre par clé
 */
exports.getSetting = (req, res) => {
  const key = req.params.key;
  
  db.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key], (err, results) => {
    if (err) {
      console.error('❌ Erreur lors de la récupération du paramètre :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    res.json({ setting: results[0].setting_value });
  });
};

/**
 * 🔹 Mettre à jour un paramètre
 */
exports.updateSetting = (req, res) => {
  const key = req.params.key;
  const { setting_value } = req.body;

  if (setting_value === undefined || typeof setting_value !== "string" || setting_value.length > 255) {
    return res.status(400).json({ error: 'Valeur du paramètre invalide' });
  }

  db.query('UPDATE settings SET setting_value = ? WHERE setting_key = ?', [setting_value, key], (err, result) => {
    if (err) {
      console.error('❌ Erreur lors de la mise à jour du paramètre :', err);
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Paramètre non trouvé' });
    }
    res.json({ message: '✅ Paramètre mis à jour avec succès', setting: setting_value });
  });
};