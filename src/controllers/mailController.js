const transporter = require('../services/mailer');
const db = require('../models/db');
const util = require('util');
const query = util.promisify(db.query).bind(db);
const fs = require('fs');
const path = require('path');

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
              <p>Accédez à votre document en entrant ce code sur <a href="https://osteozen.net/pdf-access/pdf-access.html">cette page</a>.</p>
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
  
