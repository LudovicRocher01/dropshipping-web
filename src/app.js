require('dotenv').config(); // charge les variables d'env

const express = require('express');
const path = require('path');
const app = express();

const db = require('./models/db');

const PORT = 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json());
app.use('/api/produits', require('./routes/produits'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/order', require('./routes/order'));
app.use('/api/commande', require('./routes/commande'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/formulaires', require('./routes/formulaires'));


app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

