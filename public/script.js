// Fonction pour générer le bouton d'action selon la catégorie
function getActionButton(produit) {
    if (produit.categorie === "livre") {
        return `<a href="${produit.lien_achat}" target="_blank">
                    <i class="material-icons">add_shopping_cart</i>
                </a>`;
    } else if (produit.categorie === "spray" && produit.quantite > 0) {
        return `<a href="#" class="add-to-cart" data-id="${produit.id}" data-quantite="${produit.quantite}">
                    <i class="material-icons">add_shopping_cart</i>
                </a>`;
    } else {
        // Pas besoin de retourner "En rupture" ici, on l'ajoutera visuellement dans le HTML
        return "";
    }
}

// Fonction principale pour afficher les produits
async function afficherProduits(categorie) {
    try {
        const response = await fetch('/api/produits');
        const produits = await response.json();
        const produitsFiltres = produits.filter(prod => prod.categorie === categorie);
        const container = document.getElementById("produits-container");
        container.innerHTML = ""; // Nettoyer l'affichage existant

        if (produitsFiltres.length === 0) {
            container.innerHTML = "<p>Aucun produit trouvé.</p>";
            return;
        }

        // Création des cartes de produits
        produitsFiltres.forEach(produit => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("wrapper", "produit");

            // Ajouter la classe 'rupture' si le produit est en rupture de stock
            if (produit.categorie === "spray" && produit.quantite === 0) {
                wrapper.classList.add("rupture");
            }

            const actionButton = getActionButton(produit);

            // Affichage de la quantité disponible pour les sprays
            const quantiteDisplay = produit.categorie === "spray" 
                ? `<p class="quantite-dispo">${produit.quantite > 0 ? `En stock: ${produit.quantite}` : ''}</p>` 
                : '';

            // Ajout de l'étiquette "Rupture de stock" pour les produits en rupture
            const ruptureLabel = produit.categorie === "spray" && produit.quantite === 0
                ? `<div class="rupture-label">Rupture de stock</div>`
                : '';

            wrapper.innerHTML = `
                <div class="container">
                    <div class="top product-img" style="background-image: url('${produit.image_url}')">
                        ${ruptureLabel}
                    </div>
                    <div class="bottom">
                        <div class="left">
                            <div class="details">
                                <h1>${produit.nom}</h1>
                                <p>${produit.prix}€</p>
                                ${quantiteDisplay}
                            </div>
                            <div class="buy">${actionButton}</div>
                        </div>
                    </div>
                    <div class="inside">
                        <div class="icon"><i class="material-icons">info_outline</i></div>
                        <div class="contents">
                            <p>${produit.description}</p>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(wrapper);
        });

        // Gestion des ajouts au panier avec limite de stock
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 

                const produitDiv = e.currentTarget.closest(".produit");
                const id = e.currentTarget.dataset.id;
                const maxQuantite = parseInt(e.currentTarget.dataset.quantite); // Quantité maximale disponible
                const nom = produitDiv.querySelector("h1").textContent;
                const prix = parseFloat(produitDiv.querySelector(".details p").textContent.replace("€", ""));
                const image = produitDiv.querySelector(".top").style.backgroundImage.slice(5, -2);

                ajouterAuPanier(id, nom, prix, image, maxQuantite);
            });
        });

    } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
    }
}

// Fonction pour ajouter au panier avec vérification de la quantité disponible
function ajouterAuPanier(id, nom, prix, image, maxQuantite) {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];

    let produitExistant = panier.find(prod => prod.id == id); // Comparaison avec == pour gérer les types

    if (produitExistant) {
        if (produitExistant.quantite < maxQuantite) {
            produitExistant.quantite += 1;
        } else {
            showToast(`Il n'y a plus de ${nom} disponible.`);
            return; 
        }
    } else {
        if (maxQuantite > 0) {
            panier.push({ id, nom, prix, image, quantite: 1, maxQuantite: maxQuantite });
        } else {
            showToast(`${nom} est en rupture de stock.`);
            return;
        }
    }
    

    localStorage.setItem("panier", JSON.stringify(panier));
    mettreAJourBadgePanier();
    window.location.href = "../panier.html";  // Redirection vers le panier après ajout
}


// Mise à jour du badge du panier
function mettreAJourBadgePanier() {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];
    document.querySelectorAll(".cart-count").forEach(span => {
        span.textContent = panier.reduce((total, prod) => total + prod.quantite, 0);
    });
}

// Initialisation des produits en fonction de la page
document.addEventListener("DOMContentLoaded", () => {
    mettreAJourBadgePanier();

    if (window.location.pathname.includes("health_products.html")) {
        afficherProduits("sante");
    } else if (window.location.pathname.includes("books.html")) {
        afficherProduits("livre");
    } else if (window.location.pathname.includes("sprays.html")) {
        afficherProduits("spray");
    }
});

function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("visible");

    // Après un certain temps, la notification disparaît
    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.classList.add("hidden"), 500);  // Attendre que l'animation se termine avant de cacher
    }, duration);
}
