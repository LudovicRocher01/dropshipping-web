require('dotenv').config(); // charge les variables d'env

const express = require('express'); // Import d'Express
const path = require('path'); // Permet de manipuler les chemins de fichiers
const app = express(); // Création de l'application Express

// Import de la connexion
const db = require('./models/db');

const PORT = 3000; // Port sur lequel le serveur écoute


app.use(express.static(path.join(__dirname, '../public')));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(express.json()); // Permet de lire les données JSON envoyées par le front-end
app.use('/api/produits', require('./routes/produits'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/order', require('./routes/order'));
app.use('/api/commande', require('./routes/commande'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/settings', require('./routes/settings'));



// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});

