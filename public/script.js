// Fonction pour générer le bouton d'action selon la catégorie
function getActionButton(produit) {
    if (produit.categorie === "livre") {
        return `<a href="${produit.lien_achat}" target="_blank">
                    <i class="material-icons">add_shopping_cart</i>
                </a>`;
    } else { 
        return `<a href="#" class="add-to-cart" data-id="${produit.id}">
                    <i class="material-icons">add_shopping_cart</i>
                </a>`;
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

            const actionButton = getActionButton(produit);

            wrapper.innerHTML = `
                <div class="container">
                    <div class="top" style="background-image: url('${produit.image_url}')"></div>
                    <div class="bottom">
                        <div class="left">
                            <div class="details">
                                <h1>${produit.nom}</h1>
                                <p>${produit.prix}€</p>
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

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 

                const produitDiv = e.currentTarget.closest(".produit");
                const id = e.currentTarget.dataset.id;
                const nom = produitDiv.querySelector("h1").textContent;
                const prix = parseFloat(produitDiv.querySelector(".details p").textContent.replace("€", ""));
                const image = produitDiv.querySelector(".top").style.backgroundImage.slice(5, -2);

                ajouterAuPanier(id, nom, prix, image);

                window.location.href = "../panier.html";
            });
        });

    } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
    }
}

function ajouterAuPanier(id, nom, prix, image) {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];

    let produitExistant = panier.find(prod => prod.id === id);
    if (produitExistant) {
        produitExistant.quantite += 1;
    } else {
        panier.push({ id, nom, prix, image, quantite: 1 });
    }

    localStorage.setItem("panier", JSON.stringify(panier));
    mettreAJourBadgePanier();
}

function mettreAJourBadgePanier() {
    let panier = JSON.parse(localStorage.getItem("panier")) || [];
    document.querySelectorAll(".cart-count").forEach(span => {
        span.textContent = panier.reduce((total, prod) => total + prod.quantite, 0);
    });
}

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
