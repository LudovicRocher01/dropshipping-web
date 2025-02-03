// Fonction pour récupérer et afficher les produits
async function afficherProduits(categorie) {
    try {
        const response = await fetch('/api/produits'); // Appel à l'API
        const produits = await response.json(); // Conversion en JSON

        // Filtrer les produits selon la catégorie demandée
        const produitsFiltres = produits.filter(prod => prod.categorie === categorie);

        // Sélectionner le conteneur où afficher les produits
        const container = document.getElementById("produits-container");
        container.innerHTML = ""; // Nettoyer le contenu existant

        // Vérifier s'il y a des produits à afficher
        if (produitsFiltres.length === 0) {
            container.innerHTML = "<p>Aucun produit trouvé.</p>";
            return;
        }

        // Afficher les produits dynamiquement
        produitsFiltres.forEach(produit => {
            const produitDiv = document.createElement("div");
            produitDiv.classList.add("produit"); // Classe CSS pour le style
            
            // Vérifier la catégorie du produit
            let actionButton = "";
            if (produit.categorie === "livre" || produit.categorie === "sante") {
                actionButton = `<a href="${produit.lien_achat}" target="_blank">Voir</a>`;
            } else if (produit.categorie === "spray") {
                actionButton = `<a button class="btn add-to-cart" data-id="${produit.id}">Ajouter au panier</button>`;
            }
            produitDiv.innerHTML = `
                <img src="${produit.image_url}" alt="${produit.nom}" />
                <h2>${produit.nom}</h2>
                <p>${produit.description}</p>
                <p><strong>Prix:</strong> ${produit.prix}€</p>
                ${actionButton}     
                `;

            container.appendChild(produitDiv);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
    }
}

// Fonction pour ajouter un produit au panier
function ajouterAuPanier(id, nom, description, prix, image) {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];

    // Vérifier si le produit est déjà dans le panier
    let produitExistant = panier.find(prod => prod.id === id);
    if (produitExistant) {
        produitExistant.quantite += 1;
    } else {
        panier.push({ id, nom, description, prix, image, quantite: 1 });
    }

    localStorage.setItem("panier", JSON.stringify(panier));
    mettreAJourBadgePanier();
}

// Mettre à jour le badge du panier sur toutes les pages
function mettreAJourBadgePanier() {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];
    document.querySelectorAll(".cart-count").forEach(span => {
        span.textContent = panier.reduce((total, prod) => total + prod.quantite, 0);
    });
}

// Mettre à jour le badge du panier dès le chargement de la page
document.addEventListener("DOMContentLoaded", mettreAJourBadgePanier);

// Écouteur sur les boutons "Ajouter au panier"
document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-to-cart")) {
        const produitDiv = event.target.closest(".produit");
        const id = event.target.getAttribute("data-id");
        const nom = produitDiv.querySelector("h2").textContent;
        const description = produitDiv.querySelector("p").textContent;
        const prix = parseFloat(produitDiv.querySelector("p strong").nextSibling.textContent.trim().replace("€", ""));
        const image = produitDiv.querySelector("img").src;

        ajouterAuPanier(id, nom, description, prix, image);
        alert(`${nom} a été ajouté au panier !`);
    }
});

// Mettre à jour le badge du panier au chargement
mettreAJourBadgePanier();



// Vérifier sur quelle page on se trouve et charger les produits correspondants
if (window.location.pathname.includes("health_products.html")) {
    afficherProduits("sante");
} else if (window.location.pathname.includes("books.html")) {
    afficherProduits("livre");
} else if (window.location.pathname.includes("sprays.html")) {
    afficherProduits("spray");
}
