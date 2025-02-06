// ---------------------------
// Fonctions utilitaires
// ---------------------------

// Récupérer le panier depuis localStorage
function getPanier() {
    return JSON.parse(localStorage.getItem("panier")) || [];
}

// Mettre à jour le badge du panier sur toutes les pages
function mettreAJourBadgePanier() {
    let panier = getPanier();
    document.querySelectorAll(".cart-count").forEach(span => {
        span.textContent = panier.reduce((total, prod) => total + prod.quantite, 0);
    });
}

// ---------------------------
// Affichage du panier
// ---------------------------
function afficherPanier() {
    let panier = getPanier();
    let container = document.querySelector(".cart-item-box");

    // Vider le contenu actuel
    container.innerHTML = "";

    if (panier.length === 0) {
        container.innerHTML = "<p>Votre panier est vide.</p>";
        return;
    }

    let subtotal = 0;
    panier.forEach(produit => {
        // Convertir le prix en nombre
        produit.prix = parseFloat(produit.prix);
        if (isNaN(produit.prix)) {
            console.error(`Erreur : le prix du produit ${produit.nom} est invalide.`);
            produit.prix = 0;
        }
        subtotal += produit.prix * produit.quantite;

        let produitDiv = document.createElement("div");
        produitDiv.classList.add("product-card");
        produitDiv.innerHTML = `
            <div class="card">
                <div class="img-box">
                    <img src="${produit.image}" alt="${produit.nom}" width="80px" class="product-img">
                </div>
                <div class="detail">
                    <h4 class="product-name">${produit.nom}</h4>
                    <div class="wrapper-cart">
                        <div class="product-qty">
                            <button onclick="modifierQuantite(${produit.id}, -1)">
                                <ion-icon name="remove-outline"></ion-icon>
                            </button>
                            <span>${produit.quantite}</span>
                            <button onclick="modifierQuantite(${produit.id}, 1)">
                                <ion-icon name="add-outline"></ion-icon>
                            </button>
                        </div>
                        <div class="price">
                            <span>${(produit.prix * produit.quantite).toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
                <button class="product-close-btn" onclick="supprimerProduit(${produit.id})">
                    <ion-icon name="close-outline"></ion-icon>
                </button>
            </div>
        `;
        container.appendChild(produitDiv);
    });

    let shipping = 5; // Frais de livraison fixes
    let total = subtotal + shipping;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("shipping").textContent = shipping.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
    if (document.getElementById("payAmount")) {
        document.getElementById("payAmount").textContent = total.toFixed(2);
    }
}

// ---------------------------
// Gestion du panier (quantité et suppression)
// ---------------------------
function modifierQuantite(id, changement) {
    let panier = getPanier();
    let produit = panier.find(prod => prod.id == id);
    if (produit) {
        produit.quantite += changement;
        if (produit.quantite <= 0) {
            panier = panier.filter(prod => prod.id != id);
        }
    }
    localStorage.setItem("panier", JSON.stringify(panier));
    afficherPanier();
    mettreAJourBadgePanier();
}

function supprimerProduit(id) {
    let panier = getPanier();
    panier = panier.filter(prod => prod.id != id);
    localStorage.setItem("panier", JSON.stringify(panier));
    afficherPanier();
    mettreAJourBadgePanier();
}

// ---------------------------
// Récupérer le total sécurisé depuis le serveur
// ---------------------------
async function getTotalFromServer(panier) {
    try {
        const response = await fetch('/api/order/total', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ panier: panier })
        });
        const data = await response.json();
        console.log("Réponse serveur pour le total :", data);  // Pour vérifier dans la console
        return parseFloat(data.total);
    } catch (error) {
        console.error("Erreur lors de la récupération du total sécurisé:", error);
        return 0;
    }
}

// ---------------------------
// Lancer le paiement avec PayPal et enregistrer la commande
// ---------------------------
async function lancerPaiement() {
    const panier = getPanier();
    const secureTotal = await getTotalFromServer(panier);
    let totalAmount = (secureTotal && secureTotal > 0) ? secureTotal : 50.00;
    
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create({
                purchase_units: [{
                    amount: {
                        value: totalAmount.toFixed(2)
                    }
                }]
            });
        },
        onApprove: function(data, actions) {
            return actions.order.capture().then(function(details) {
                alert('Transaction réussie par ' + details.payer.name.given_name);
                
                // Préparer les données de la commande à envoyer au serveur
                const panier = getPanier();
                const orderData = {
                    client: {
                        prenom: details.payer.name.given_name,
                        nom: details.payer.name.surname,
                        email: details.payer.email_address,
                        adresse: details.purchase_units[0].shipping && details.purchase_units[0].shipping.address 
                                 ? `${details.purchase_units[0].shipping.address.address_line_1 || ''} ${details.purchase_units[0].shipping.address.admin_area_2 || ''} ${details.purchase_units[0].shipping.address.postal_code || ''}`.trim()
                                 : '',
                        telephone: '' // PayPal ne fournit pas toujours le numéro de téléphone
                    },
                    produits: panier,  // Stocke la liste des produits commandés
                    total: totalAmount.toFixed(2),
                    transactionId: details.id
                };
        
                // Envoyer la commande au serveur
                fetch('/api/commande/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
                .then(response => response.json())
                .then(data => {
                    console.log("Commande enregistrée :", data);
                    // Stocker les informations pour le récapitulatif dans sessionStorage
                    sessionStorage.setItem("orderClient", JSON.stringify(orderData.client));
                    sessionStorage.setItem("orderProduits", JSON.stringify(orderData.produits));
                    sessionStorage.setItem("orderTotal", orderData.total);
                    sessionStorage.setItem("orderId", data.orderId); // si votre endpoint renvoie un orderId
                    // Vider le panier après confirmation
                    localStorage.removeItem("panier");
                    // Rediriger vers la page de récapitulatif dans une nouvelle fenêtre
                    window.open("recap-commande.html", "_blank");
                })
                .catch(err => {
                    console.error("Erreur lors de l'enregistrement de la commande :", err);
                });
            });
        },
        
        onError: function(err) {
            console.error('Erreur lors du paiement:', err);
            alert('Une erreur est survenue lors du paiement.');
        }
    }).render('#paypal-button-container');
}

// ---------------------------
// Initialisation au chargement du DOM
// ---------------------------
document.addEventListener("DOMContentLoaded", () => {
    afficherPanier();
    mettreAJourBadgePanier();
    lancerPaiement();
});
