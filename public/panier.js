// Fonction pour afficher les produits du panier
function afficherPanier() {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];
    let container = document.getElementById("panier-container");

    // Vider le contenu actuel
    container.innerHTML = "";

    if (panier.length === 0) {
        container.innerHTML = "<p>Votre panier est vide.</p>";
        return;
    }

    let total = 0;
    panier.forEach(produit => {
        total += produit.prix * produit.quantite;

        let produitDiv = document.createElement("div");
        produitDiv.classList.add("panier-item");
        produitDiv.innerHTML = `
            <img src="${produit.image}" width="50">
            <h2>${produit.nom}</h2>
            <p><strong>Prix: </strong>${produit.prix}€</p>
            <div class="quantite">
                <button onclick="modifierQuantite(${produit.id}, -1)">➖</button>
                <span>${produit.quantite}</span>
                <button onclick="modifierQuantite(${produit.id}, 1)">➕</button>
            </div>
            <button class="remove-btn" onclick="supprimerProduit(${produit.id})">❌ Supprimer</button>
        `;
        container.appendChild(produitDiv);
    });

    let totalDiv = document.createElement("div");
    totalDiv.classList.add("total");
    totalDiv.innerHTML = `<h3>Total: ${total.toFixed(2)}€</h3>`;
    container.appendChild(totalDiv);
}

// Modifier la quantité d'un produit
function modifierQuantite(id, changement) {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];

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

// Supprimer un produit du panier
function supprimerProduit(id) {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];
    panier = panier.filter(prod => prod.id != id);

    localStorage.setItem("panier", JSON.stringify(panier));
    afficherPanier();
    mettreAJourBadgePanier();
}

// Charger le panier au démarrage
afficherPanier();

// Mettre à jour le badge du panier sur toutes les pages
function mettreAJourBadgePanier() {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];
    document.querySelectorAll(".cart-count").forEach(span => {
        span.textContent = panier.reduce((total, prod) => total + prod.quantite, 0);
    });
}

// Mettre à jour le badge du panier dès le chargement de la page
document.addEventListener("DOMContentLoaded", mettreAJourBadgePanier);
