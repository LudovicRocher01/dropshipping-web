const jwt = require("jsonwebtoken");

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
