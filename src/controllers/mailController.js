const transporter = require('../services/mailer');
const db = require('../models/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);

/**
 * Récupérer les frais de livraison depuis la BDD
 */
async function getShippingFee() {
  try {
    const results = await query('SELECT setting_value FROM settings WHERE setting_key = ?', ['shipping_fee']);
    return results.length > 0 ? parseFloat(results[0].setting_value) || 0 : 5; // 5€ par défaut
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des frais de port :", error);
    return 5;
  }
}

/**
 * 🔹 Envoyer l'email de confirmation au client
 */
exports.envoyerConfirmationCommande = async (client, produits, total, transactionId) => {
  const prixLivraison = client.adresse === "Retrait au cabinet" ? 0 : await getShippingFee();
  
  const mailOptions = {
    from: process.env.MAIL_FROM,
    replyTo: process.env.MAIL_CONTACT,
    to: client.email,
    subject: '🛍️ Confirmation de votre commande - Osteozen',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #4CAF50;">Merci ${client.prenom} ${client.nom} pour votre commande !</h2>
        <p>Votre commande a bien été prise en compte. Voici les détails :</p>

        <h3>🛒 Récapitulatif de la commande :</h3>
        <ul style="list-style: none; padding: 0;">
          ${produits.map(p => `
            <li style="border-bottom: 1px solid #ddd; padding: 10px;">
              <img src="${p.image_url}" alt="${p.nom}" style="width: 50px; vertical-align: middle;">
              <strong>${p.nom}</strong> (x${p.quantite}) - <strong>${parseFloat(p.prix).toFixed(2)} €</strong>
            </li>
          `).join('')}
          <li><p> <strong> Prix Livraison : ${prixLivraison}€ </strong></p></li>
        </ul>
        <p><strong>Total payé : ${total.toFixed(2)} €</strong></p>
        <p>📌 Transaction ID : <strong>${transactionId}</strong></p>
        <p>🚚 Livraison : ${client.adresse}</p>

        <p>📩 Une question ? Contactez-moi à <a href="mailto:${process.env.MAIL_CONTACT}">${process.env.MAIL_CONTACT}</a></p>
        <p href="https://osteozen.net"> Merci pour votre confiance, à bientôt sur <strong>Osteozen</strong> !</p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("📧 Email de confirmation envoyé : %s", info.messageId);
};

/**
 * 🔹 Envoyer l'email de notification au vendeur
 */
exports.notifierVendeur = async (client, produits, total, transactionId) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_ADMIN,
    subject: '📢 Nouvelle commande reçue - Osteozen',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #d9534f;">📢 Nouvelle commande reçue !</h2>
        <p><strong>Client :</strong> ${client.prenom} ${client.nom}</p>
        <p><strong>Email :</strong> ${client.email}</p>
        <p><strong>Adresse :</strong> ${client.adresse}</p>

        <h3>🛒 Produits commandés :</h3>
        <ul style="list-style: none; padding: 0;">
          ${produits.map(p => `
            <li style="border-bottom: 1px solid #ddd; padding: 10px;">
              <img src="${p.image_url}" alt="${p.nom}" style="width: 50px; vertical-align: middle;">
              <strong>${p.nom}</strong> (x${p.quantite}) - <strong>${parseFloat(p.prix).toFixed(2)} €</strong>
            </li>
          `).join('')}
        </ul>

        <p><strong>Total payé : ${total.toFixed(2)} €</strong></p>
        <p>📌 Transaction ID : <strong>${transactionId}</strong></p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("📧 Notification de commande envoyée au vendeur : %s", info.messageId);
};