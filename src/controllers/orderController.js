const db = require('../models/db');

/**
 * 🔹 Calcule le total du panier en prenant en compte les frais de livraison
 */
exports.calculerTotalPanier = async (req, res) => {
  try {
    const { panier, retraitMagasin } = req.body;

    // Vérification des données
    if (!Array.isArray(panier) || panier.length === 0) {
      return res.status(400).json({ error: 'Données du panier invalides' });
    }
    if (typeof retraitMagasin !== 'boolean') {
      return res.status(400).json({ error: "Le paramètre 'retraitMagasin' est invalide" });
    }

    let total = 0;

    // Vérification des produits et calcul du total
    for (let item of panier) {
      if (!item.id || !Number.isInteger(item.id) || item.id < 1 || !Number.isFinite(item.quantite) || item.quantite <= 0) {
        return res.status(400).json({ error: "Données du produit invalides" });
      }

      const [results] = await db.promise().query('SELECT prix FROM produits WHERE id = ?', [item.id]);

      if (results.length === 0) {
        return res.status(400).json({ error: `Produit avec ID ${item.id} non trouvé.` });
      }

      total += parseFloat(results[0].prix) * item.quantite;
    }

    // Ajout des frais de livraison si non retrait magasin
    if (!retraitMagasin) {
      total += await getShippingFee();
    }

    res.json({ total: total.toFixed(2) });

  } catch (err) {
    console.error("❌ Erreur lors du calcul du total :", err);
    res.status(500).json({ error: 'Erreur serveur lors du calcul du total' });
  }
};

/**
 * 🔹 Récupérer les frais de livraison depuis la BDD
 */
async function getShippingFee() {
  try {
    const [results] = await db.promise().query('SELECT setting_value FROM settings WHERE setting_key = ?', ['shipping_fee']);
    return results.length > 0 ? parseFloat(results[0].setting_value) || 5 : 5; // 5€ par défaut
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des frais de port :", error);
    return 5;
  }
}