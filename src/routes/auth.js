const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

router.post("/login", async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: "Mot de passe requis" });
    }

    const hashedPassword = process.env.ADMIN_PASSWORD_HASH;

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
        return res.status(401).json({ error: "Mot de passe incorrect" });
    }

    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Connexion réussie", token });
});

router.post("/verify", (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé" });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        res.json({ message: "Token valide" });
    } catch (err) {
        res.status(403).json({ error: "Token invalide" });
    }
});

module.exports = router;
