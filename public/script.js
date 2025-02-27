function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes("health_products.html")) return "sante";
    if (path.includes("books.html")) return "livre";
    if (path.includes("sprays.html")) return "spray";
    if (path.includes("conferences.html")) return "conference";
    return "accueil";
}

function getActionButton(produit) {
    if (produit.categorie === "livre" || produit.categorie === "sante") {
        return `<a href="${produit.lien_achat}" target="_blank">
                    <i class="material-icons">add_shopping_cart</i>
                </a>`;
    } else if (produit.categorie === "spray" && produit.quantite > 0) {
        return `<a href="#" class="add-to-cart" data-id="${produit.id}" data-quantite="${produit.quantite}">
                    <i class="material-icons">add_shopping_cart</i>
                </a>`;
    } else {
        return "";
    }
}

async function afficherProduits(categorie) {
    try {
        const response = await fetch('/api/produits');
        const produits = await response.json();
        const produitsFiltres = produits.filter(prod => prod.categorie === categorie);
        const container = document.getElementById("produits-container");
        container.innerHTML = "";

        if (produitsFiltres.length === 0) {
            container.innerHTML = "<p>Aucun produit trouvé.</p>";
            return;
        }
        produitsFiltres.forEach(produit => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("wrapper", "produit");

            if (produit.categorie === "spray" && produit.quantite === 0) {
                wrapper.classList.add("rupture");
            }

            const actionButton = getActionButton(produit);

            const quantiteDisplay = produit.categorie === "spray" 
                ? `<p class="quantite-dispo">${produit.quantite > 0 ? `En stock: ${produit.quantite}` : ''}</p>` 
                : '';

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

        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault(); 

                const produitDiv = e.currentTarget.closest(".produit");
                const id = e.currentTarget.dataset.id;
                const maxQuantite = parseInt(e.currentTarget.dataset.quantite);
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

function showToast(message, duration = 3000) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("visible");

    setTimeout(() => {
        toast.classList.remove("visible");
        setTimeout(() => toast.classList.add("hidden"), 500);
    }, duration);
}

function ouvrirPanier() {
    document.getElementById("sidebar-panier").classList.add("open");
    afficherPanier();
}

function fermerPanier() {
    document.getElementById("sidebar-panier").classList.remove("open");
}

function getPanier() {
    return JSON.parse(localStorage.getItem("panier")) || [];
}

function ajouterAuPanier(id, nom, prix, image, maxQuantite) {
    let panier = getPanier();
    let produitExistant = panier.find(prod => prod.id == id);

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
    afficherPanier();
    ouvrirPanier();
}

function mettreAJourBadgePanier() {
    let panier = getPanier();
    document.querySelectorAll(".cart-count").forEach(span => {
        span.textContent = panier.reduce((total, prod) => total + prod.quantite, 0);
    });
}

async function afficherPanier() {
    let panier = getPanier();
    let container = document.getElementById("panier-container");

    container.innerHTML = "";
    
    if (panier.length === 0) {
        container.innerHTML = "<p>Votre panier est vide.</p>";
        document.querySelector(".amount").style.display = "none";
        document.getElementById("validerPanier").style.display = "none";
        return;
    }
    
    document.querySelector(".amount").style.display = "";
    document.getElementById("validerPanier").style.display = "";
    
    let subtotal = 0;
    panier.forEach(produit => {
        produit.prix = parseFloat(produit.prix);
        if (isNaN(produit.prix)) produit.prix = 0;
        subtotal += produit.prix * produit.quantite;

        let produitDiv = document.createElement("div");
        produitDiv.classList.add("product-card");
        produitDiv.innerHTML = `
            <img src="${produit.image}" alt="${produit.nom}" class="product-img">
            <div class="product-info">
                <span class="product-name">${produit.nom}</span>
                <div class="product-qty">
                    <button onclick="modifierQuantite(${produit.id}, -1)">-</button>
                    <span>${produit.quantite}</span>
                    <button onclick="modifierQuantite(${produit.id}, 1)">+</button>
                </div>
                <span class="product-price">${(produit.prix * produit.quantite).toFixed(2)} €</span>
            </div>
            <button class="delete-btn" onclick="supprimerProduit(${produit.id})">🗑️</button>
        `;
        container.appendChild(produitDiv);
    });

    const retraitMagasin = sessionStorage.getItem("retraitMagasin") === "true";
    const shipping = retraitMagasin ? 0 : await getShippingFee();
    let total = subtotal + shipping;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("shipping").textContent = shipping.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);

    const retraitCheckbox = document.getElementById("retraitMagasin");
    if (retraitCheckbox) {
        retraitCheckbox.checked = retraitMagasin;
    }
}

function modifierQuantite(id, changement) {
    let panier = getPanier();
    let produit = panier.find(prod => prod.id == id);

    if (produit) {
        const maxQuantite = produit.maxQuantite || Infinity;

        if (changement > 0) {
            if (produit.quantite < maxQuantite) {
                produit.quantite += changement;
            } else {
                showToast(`Vous avez atteint la quantité maximale disponible pour ${produit.nom}.`);
                return;
            }
        } else {
            produit.quantite += changement;
            if (produit.quantite <= 0) {
                panier = panier.filter(prod => prod.id != id);
                showToast(`${produit.nom} a été retiré de votre panier.`);
            }
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

async function getShippingFee() {
    try {
        const response = await fetch('/api/settings/shipping_fee');
        const data = await response.json();
        return parseFloat(data.setting) || 0;
    } catch (error) {
        console.error("Erreur lors de la récupération des frais de port :", error);
        return 0;
    }
}
function validerPanier() {
    const panier = getPanier();
    if (panier.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    sessionStorage.setItem("panierValide", JSON.stringify(panier));

    const retraitCheckbox = document.getElementById("retraitMagasin");
    if (retraitCheckbox) {
        sessionStorage.setItem("retraitMagasin", retraitCheckbox.checked.toString());
    }

    const currentPath = window.location.pathname;
    let paiementPath = "paiement/paiement.html";

    if (currentPath.includes("/products/")) {
        paiementPath = "../paiement/paiement.html";
    }

    window.location.href = paiementPath;
}

async function chargerConferences() {
    try {
        const response = await fetch('/api/produits');
        const produits = await response.json();

        const conferences = produits.filter(prod => prod.categorie === "conference");

        const container = document.getElementById("conferences-container");
        container.innerHTML = "";

        if (conferences.length === 0) {
            container.innerHTML = "<p>Aucune conférence disponible.</p>";
            return;
        }

        conferences.forEach(conference => {
            const div = document.createElement("div");
            div.classList.add("conference-card");

            div.innerHTML = `
                <img src="${conference.image_url}" alt="${conference.nom}">
                <div class="content">
                    <h3>${conference.nom}</h3>
                    <p>${conference.description}</p>
                    <button class="btn-preinscription" onclick="ouvrirModal(${conference.id})">Pré-inscription</button>
                </div>
            `;

            container.appendChild(div);
        });

    } catch (error) {
        console.error("Erreur lors du chargement des conférences :", error);
    }
}

function initialiserPreinscription() {
    document.getElementById("preinscription-modal").addEventListener("click", fermerModal);

    document.getElementById("preinscription-form").addEventListener("submit", async function (event) {
        event.preventDefault();

        const conferenceId = document.getElementById("conference_id").value;
        const nom = document.getElementById("nom").value;
        const prenom = document.getElementById("prenom").value;
        const email = document.getElementById("email").value;
        const telephone = document.getElementById("telephone").value;

        try {
            const response = await fetch("/api/formulaires", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nom, prenom, email, telephone, conference_id: conferenceId })
            });

            const result = await response.json();
            showToast("Pré-inscription enregistrée avec succès !");
            fermerModal();
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
        }
    });

    document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") {
            fermerModal();
        }
    });
}

function ouvrirModal(conferenceId) {
    document.getElementById("preinscription-modal").style.display = "flex";
    document.getElementById("conference_id").value = conferenceId;
}

function fermerModal(event) {
    const modal = document.getElementById("preinscription-modal");

    if (!event || event.target === modal) {
        modal.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const page = getCurrentPage();

    if (page === "sante" || page === "livre" || page === "spray") {
        afficherProduits(page);
    } 
    else if (page === "conference") {
        chargerConferences();
        initialiserPreinscription();
    }

    const btnCommander = document.getElementById("validerPanier");
    if (btnCommander) {
        btnCommander.addEventListener("click", validerPanier);
    }

    const retraitCheckbox = document.getElementById("retraitMagasin");
    if (retraitCheckbox) {
        retraitCheckbox.addEventListener("change", () => {
            sessionStorage.setItem("retraitMagasin", retraitCheckbox.checked.toString());
            afficherPanier();
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const retraitCheckbox = document.getElementById("retraitMagasin");
    if (retraitCheckbox) {
        retraitCheckbox.addEventListener("change", () => {
            sessionStorage.setItem("retraitMagasin", retraitCheckbox.checked.toString());
            afficherPanier();
        });
    }
});

fetch('/composants/footer.html')
.then(response => response.text())
.then(data => {
    document.getElementById('footer-container').innerHTML = data;
});

fetch('/composants/sidebar.html')
.then(response => response.text())
.then(data => {
    document.body.insertAdjacentHTML('beforeend', data);
      
    afficherPanier();
    mettreAJourBadgePanier();
      
    const btnCommander = document.getElementById("validerPanier");
    if (btnCommander) {
        btnCommander.addEventListener("click", validerPanier);
    } else {
        console.error("❌ Erreur : Bouton 'Commander' introuvable !");
    }
      
    const retraitCheckbox = document.getElementById("retraitMagasin");
    if (retraitCheckbox) {
        retraitCheckbox.addEventListener("change", () => {
            sessionStorage.setItem("retraitMagasin", retraitCheckbox.checked.toString());
            afficherPanier();
        });
    }
});