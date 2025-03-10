const path = require("path");
const db = require("../models/db");
const transporter = require("../services/mailer");
const util = require("util");
const query = util.promisify(db.query).bind(db);
const { envoyerCodeAccesPDF } = require("./mailController");


exports.verifierCode = async (req, res) => {
    const accessCode = req.params.code;

    try {
        const results = await query("SELECT code FROM pdf_access");
        
        const validCode = results.find(row => bcrypt.compareSync(accessCode, row.code));

        if (!validCode) {
            return res.status(403).json({ error: "Code invalide ou expiré." });
        }

        const pdfPath = "/var/www/osteozen/private_pdfs/La_Mascarade_Alimentaire.pdf";
        res.sendFile(pdfPath);
    } catch (err) {
        console.error("Erreur lors de la vérification du code :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};


const bcrypt = require("bcrypt");

exports.genererCodeAcces = async (req, res) => {
    const { email, transactionId } = req.body;

    if (!email || !transactionId) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    const accessCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    const hashedCode = await bcrypt.hash(accessCode, 10);

    try {
        await query("INSERT INTO pdf_access (email, code, transaction_id) VALUES (?, ?, ?)", [email, hashedCode, transactionId]);

        await envoyerCodeAccesPDF(email, accessCode);

        res.json({ message: "Code généré et envoyé", code: accessCode });
    } catch (err) {
        console.error("Erreur lors de la génération du code :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};
