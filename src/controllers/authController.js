const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ error: "Mot de passe requis" });
        }

        const hashedPassword = process.env.ADMIN_PASSWORD_HASH;
        if (!hashedPassword) {
            console.error("Erreur serveur: Aucun mot de passe hashé configuré.");
            return res.status(500).json({ error: "Erreur serveur." });
        }

        const match = await bcrypt.compare(password, hashedPassword);
        if (!match) {
            return res.status(401).json({ error: "Mot de passe incorrect" });
        }

        const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.cookie("authToken", token, {
            httpOnly: true,
            secure: true,
            sameSite: "Strict",
            maxAge: 3600000,
        });

        res.json({ message: "Connexion réussie" });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.verifyToken = (req, res) => {
    try {
        const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Accès refusé" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: "Token invalide" });
            }
            res.json({ message: "Token valide", role: decoded.role });
        });
    } catch (err) {
        console.error("Erreur lors de la vérification du token :", err);
        res.status(500).json({ error: "Erreur serveur" });
    }
};

exports.verifierAdmin = (req, res, next) => {
    const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Token manquant." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== "admin") {
            return res.status(403).json({ error: "Accès interdit. Permission refusée." });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token invalide." });
    }
};
