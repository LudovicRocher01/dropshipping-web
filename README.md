# Read Me

## Projet Node.js 
Environnement d'exécution JavaScript côté serveur. C'est la base du back-end (côté serveur) pour gérer les routes, les requêtes des utilisateurs, les connexions à la base de données, etc.

## MySQL
système de gestion de base de données relationnelle

## Extensions
Prettier : formate automatiquement le code pour le rendre plus propre.
Live Server : permet de prévisualiser les fichiers HTML dans le navigateur.
Node.js Extension Pack : ajoute des outils pour Node.js.

## Packages
dotenv
Pour ne pas mettre en clair les informations sensibles (mot de passe MySQL, etc.) dans le code, permet de charger ces infos depuis un fichier .env qui ne sera pas partagé publiquement (par exemple sur GitHub).

## Structure du projet :
dropshipping-site/
├── public/            # Pour les fichiers front-end (HTML, CSS, JS)
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── src/               # Pour le back-end (Node.js)
│   ├── app.js         # Point d'entrée du serveur
│   ├── routes/        # Routes pour les API
│   ├── models/        # Modèles pour la base de données
│   └── controllers/   # Logique métier
├── .env               # Configuration des variables d'environnement
├── package.json       # Créé automatiquement par npm init
└── README.md          # Documentation
