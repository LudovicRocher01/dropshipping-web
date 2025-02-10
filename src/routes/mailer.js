const nodemailer = require('nodemailer');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

// Utilise un compte Ethereal existant pour simplifier
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: 'georgette.oconner@ethereal.email',
    pass: 'zjVgBWVcQf7eBaXt8g'
  }
});

async function envoyerConfirmationCommande(client, produits, total) {
  const produitsListe = produits.map(p =>
    `<li>${p.nom} (x${p.quantite}) - ${p.prix} €</li>`).join('');

  const mailOptions = {
    from: '"Osteozen" <order@osteozen.net>',
    to: client.email,
    subject: 'Confirmation de votre commande - Osteozen',
    html: `
      <h2>Merci ${client.prenom} ${client.nom} pour votre commande !</h2>
      <p>Voici le récapitulatif de votre commande :</p>
      <ul>${produitsListe}</ul>
      <p><strong>Total : ${total} €</strong></p>
      <p>Votre commande sera traitée sous peu. Merci de votre confiance !</p>
    `
  };

  const info = await transporter.sendMail(mailOptions);
  console.log("Email envoyé : %s", info.messageId);
  console.log("Aperçu de l'email : %s", nodemailer.getTestMessageUrl(info));
}

module.exports = { envoyerConfirmationCommande };
