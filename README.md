# Read Me

## Projet Node.js 
Osteozen est une plateforme de dropshipping permettant de vendre des produits de santé, des livres et des conférences. Le site fonctionne avec Node.js pour le back-end, MySQL pour la base de données, Express.js pour la gestion des routes et PayPal API pour le paiement en ligne.

## Technologies 
Node.js : Environnement d'exécution JavaScript côté serveur.
Express.js : Framework minimaliste pour créer les routes et gérer les requêtes.
MySQL : Base de données relationnelle pour stocker les produits, commandes et utilisateurs.
Nginx : Serveur proxy utilisé pour rediriger les requêtes HTTP vers l'application Node.js.
PayPal API : Gestion des paiements en ligne sécurisés.
Nodemailer : Envoi automatique d'e-mails pour la confirmation de commandes et l'accès aux PDF.
PM2 : Gestionnaire de processus Node.js pour exécuter et superviser l'application.

## Packages
dotenv
Pour ne pas mettre en clair les informations sensibles (mot de passe MySQL, etc.) dans le code, permet de charger ces infos depuis un fichier .env qui ne sera pas partagé publiquement (par exemple sur GitHub).

dropshipping-site/
├── public/                # Fichiers front-end accessibles publiquement
│   ├── index.html         # Page principale du site
│   ├── styles.css         # Styles CSS généraux
│   ├── script.js          # JavaScript pour l'interaction avec le DOM
│   ├── pdf-access.html    # Page d'achat et d'accès sécurisé au PDF
│   ├── paiement/          # Pages liées au paiement
│   └── uploads/           # Stockage des images uploadées
│
├── src/                   # Back-end (Node.js)
│   ├── app.js             # Point d'entrée du serveur
│   ├── routes/            # Gestion des routes API
│   │   ├── produits.js    # Routes pour gérer les produits
│   │   ├── paypal.js      # Routes pour le paiement PayPal
│   │   ├── pdf.js         # Routes pour la gestion des PDF
│   │   ├── mailer.js      # Routes pour l'envoi d'e-mails
│   │   ├── auth.js        # Routes pour l'authentification
│   ├── models/            # Gestion des connexions à la base de données
│   │   ├── db.js          # Connexion MySQL
│   ├── controllers/       # Logique métier et gestion des actions API
│   │   ├── produitsController.js  
│   │   ├── paypalController.js  
│   │   ├── pdfController.js  
│   │   ├── mailController.js  
│   ├── services/          # Services indépendants
│   │   ├── mailer.js      # Service d'envoi d'e-mails avec Nodemailer
│   ├── middleware/        # Middleware pour gérer l'authentification
│   │   ├── auth.js        # Vérification des jetons JWT
│
│
├── .env                   # Fichier contenant les variables d'environnement (non partagé sur GitHub)
├── package.json           # Dépendances et scripts Node.js
├── README.md              # Documentation
