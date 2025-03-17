function getPanierValide() {
    return JSON.parse(localStorage.getItem("panierValide")) || [];
}

async function afficherPanier() {
    let panier = getPanierValide();
    let container = document.getElementById("paiement-container");
    container.innerHTML = "";

    if (panier.length === 0) {
        container.innerHTML = "<p>Votre panier est vide. Retournez choisir des produits.</p>";
        return;
    }

    let subtotal = 0;
    panier.forEach(produit => {
        produit.prix = parseFloat(produit.prix);
        if (isNaN(produit.prix)) produit.prix = 0;
        subtotal += produit.prix * produit.quantite;

        let produitDiv = document.createElement("div");
        produitDiv.classList.add("product-card");
        produitDiv.innerHTML = `
        <div class="card">
            <img src="${produit.image}" width="80px" alt="${produit.nom}" class="product-img">
            <div class="product-info">
                <span class="product-name">${produit.nom}</span>
                <div class="product-qty">
                    <span>Quantité: ${produit.quantite}</span>
                </div>
                <span class="product-price">${(produit.prix * produit.quantite).toFixed(2)} €</span>
            </div>
            </div>
        `;
        container.appendChild(produitDiv);
    });

    const retraitMagasin = localStorage.getItem("retraitMagasin") === "true";
    const shipping = retraitMagasin ? 0 : await getShippingFee();
    let total = subtotal + shipping;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("shipping").textContent = shipping.toFixed(2);
    document.getElementById("total").textContent = total.toFixed(2);
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

async function lancerPaiement() {
    let panier = getPanierValide();
    if (panier.length === 0) {
        alert("Votre panier est vide !");
        return;
    }

    const retraitMagasin = localStorage.getItem("retraitMagasin") === "true";
    const shippingFee = retraitMagasin ? 0 : await getShippingFee();
    let totalAmountGlobal = panier.reduce((total, prod) => total + prod.prix * prod.quantite, 0) + shippingFee;

    paypal.Buttons({
        createOrder: async function (data, actions) {
            try {
                const response = await fetch("/api/paypal/order", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ total: totalAmountGlobal })
                });
        
                const data = await response.json();
                if (!data.orderID) {
                    throw new Error("Impossible de récupérer un Order ID PayPal");
                }
                
                return data.orderID;
            } catch (error) {
                console.error("❌ Erreur lors de la création de l'ordre PayPal :", error);
                alert("Erreur lors du paiement. Veuillez réessayer.");
            }
        },
        
        onApprove: function (data, actions) {
            return actions.order.capture().then(function (details) {
                document.getElementById("loading-overlay").style.display = "flex";
        
                const adresseFinale = retraitMagasin ? "Retrait au cabinet" :
                    `${details.purchase_units[0].shipping?.address.address_line_1}, ${details.purchase_units[0].shipping.address.admin_area_2}, ${details.purchase_units[0].shipping.address.postal_code}`;
        
                const client = {
                    prenom: details.payer.name.given_name,
                    nom: details.payer.name.surname,
                    email: details.payer.email_address,
                    adresse: adresseFinale
                };
        
                const orderData = {
                    client,
                    produits: panier,
                    total: totalAmountGlobal.toFixed(2),
                    transactionId: details.id
                };
        
                localStorage.setItem("orderClient", JSON.stringify(client));
                localStorage.setItem("orderProduits", JSON.stringify(panier));
                localStorage.setItem("orderTotal", totalAmountGlobal.toFixed(2));
                localStorage.setItem("orderTransactionId", details.id);
        
                fetch('/api/commande/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderData)
                })
                .then(response => response.json())
                .then(data => {
                    localStorage.setItem("orderId", data.orderId);
                    localStorage.removeItem("panier");
                    localStorage.removeItem("panierValide");
        
                    setTimeout(() => {
                        window.location.href = "../recap/recap-commande.html";
                    }, 1000);
                })
                .catch(err => {
                    console.error("Erreur enregistrement commande :", err);
                    document.getElementById("loading-overlay").style.display = "none";
                    alert("Une erreur s'est produite lors du paiement. Veuillez réessayer.");
                });
            });
        }
            }).render('#paypal-button-container');
}



document.addEventListener("DOMContentLoaded", () => {
    let panier = JSON.parse(localStorage.getItem("panierValide")) || [];
    
    if (panier.length > 0) {
        afficherPanier();
        lancerPaiement();
    } else {
        console.warn("⚠️ Panier vide, possible perte de session.");
    }
});

