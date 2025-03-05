require('dotenv').config(); // charge les variables d'env

const express = require('express');
const path = require('path');
const app = express();
const db = require('./models/db');
const cookieParser = require("cookie-parser");
const fs = require('fs')
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });

const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());
app.use(cookieParser());

const authRoutes = require("./routes/auth").router;
app.use("/api/auth", authRoutes);

app.use('/api/produits', require('./routes/produits'));
app.use('/api/order', require('./routes/order'));
app.use('/api/commande', require('./routes/commande'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/formulaires', require('./routes/formulaires'));

app.use((req, res, next) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}\n`;
    logStream.write(log);
    console.log(log);
    next();
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
