const transporter = require('../services/mailer');
const db = require('../models/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const fs = require('fs');
const path = require('path');

async function getShippingFee() {
  try {
    const results = await query('SELECT setting_value FROM settings WHERE setting_key = ?', ['shipping_fee']);
    return results.length > 0 ? parseFloat(results[0].setting_value) || 0 : 5;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des frais de port :", error);
    return 5;
  }
}

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
              <strong>${p.nom}</strong> (x${p.quantite}) - <strong>${parseFloat(p.prix).toFixed(2)} €</strong>
            </li>
          `).join('')}
          <li><p><strong>Frais de Livraison : ${prixLivraison.toFixed(2)} €</strong></p></li>
        </ul>

        <p><strong>Total payé : ${total.toFixed(2)} €</strong></p>
        <p>📌 Transaction ID : <strong>${transactionId}</strong></p>
        <p>🚚 Livraison : ${client.adresse}</p>

        <p>📩 Une question ? Contactez-moi à <a href="mailto:${process.env.MAIL_CONTACT}">${process.env.MAIL_CONTACT}</a></p>
        <p>Merci pour votre confiance, à bientôt sur <a href="https://osteozen.net" style="color: #4CAF50; text-decoration: none;"><strong>Osteozen</strong></a> !</p>
      </div>
    `
  };

  const info = await transporter.sendMail(mailOptions);
};

exports.notifierVendeur = async (client, produits, total, transactionId) => {
  const mailOptions = {
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_CONTACT,
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
};

exports.envoyerCodeAccesPDF = async (email, accessCode) => {
  const mailOptions = {
      from: process.env.MAIL_FROM,
      to: email,
      subject: "📄 Votre code d'accès au PDF - La Mascarade Alimentaire",
      html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
              <h2 style="color: #4CAF50;">📄 Accès au PDF - La Mascarade Alimentaire</h2>
              <p>Merci pour votre achat ! Voici votre code d'accès :</p>
              <h2 style="background: #f3f3f3; padding: 10px; display: inline-block; border-radius: 5px;">${accessCode}</h2>
              <p>Accédez à votre document en entrant ce code sur <a href="https://osteozen.net/pdf-access.html">cette page</a>.</p>
              <p>Si vous avez des questions, contactez-nous.</p>
              <p><strong>sosteopathe@gmail.com</strong></p>
          </div>
      `
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log(`📩 Email envoyé avec succès à ${email}`);
  } catch (error) {
      console.error("❌ Erreur lors de l'envoi de l'email :", error);
      throw new Error("Échec de l'envoi du code d'accès.");
  }
};

exports.notifierPreinscription = async (nom, prenom, email, telephone, conferenceId) => {
  try {
      const results = await query("SELECT nom FROM produits WHERE id = ?", [conferenceId]);
      const conferenceNom = results.length > 0 ? results[0].nom : "Conférence inconnue";

      const mailOptions = {
          from: process.env.MAIL_FROM,
          to: process.env.MAIL_CONTACT,
          subject: '📢 Nouvelle pré-inscription à une conférence',
          html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2 style="color: #d9534f;">📢 Nouvelle pré-inscription reçue !</h2>
                  <p>Une personne vient de se pré-inscrire à une conférence :</p>

                  <h3>📌 Détails :</h3>
                  <ul style="list-style: none; padding: 0;">
                      <li><strong>Nom :</strong> ${nom} ${prenom}</li>
                      <li><strong>Email :</strong> ${email}</li>
                      <li><strong>Téléphone :</strong> ${telephone}</li>
                      <li><strong>Conférence :</strong> ${conferenceNom}</li>
                  </ul>
              </div>
          `
      };

      await transporter.sendMail(mailOptions);
      console.log(`📩 Email envoyé à ${process.env.MAIL_CONTACT} pour la pré-inscription.`);
  } catch (error) {
      console.error("Erreur lors de l'envoi de la notification de pré-inscription :", error);
  }
};
  
