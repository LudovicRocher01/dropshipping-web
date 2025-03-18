require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const db = require('./models/db');
const cookieParser = require("cookie-parser");
const fs = require('fs')
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
const favicon = require('serve-favicon');

app.use(favicon(path.join(__dirname, '../public/images', 'favicon.ico')));

const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.set('trust proxy', 1);

app.use((req, res, next) => {
    const log = `${new Date().toISOString()} - ${req.method} ${req.url} - IP: ${req.ip}\n`;
    logStream.write(log);
    console.log(log);
    next();
});

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
app.use('/api/paypal', require('./routes/paypal'));
app.use("/api/pdf", require("./routes/pdf"));

app.use((req, res) => {
    res.status(404).send("404 - Page non trouvée !");
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
