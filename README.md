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
