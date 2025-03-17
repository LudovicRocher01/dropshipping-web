document.addEventListener("DOMContentLoaded", async() => {
    const client = JSON.parse(localStorage.getItem("orderClient"));
    const produits = JSON.parse(localStorage.getItem("orderProduits"));
    const total = localStorage.getItem("orderTotal");
    const transactionId = localStorage.getItem("orderTransactionId");
    const prixLivraison = (client.adresse === "Retrait au cabinet") ? 0 : await getShippingFee();;

    if (client) {
        document.getElementById("remerciement").textContent = `Merci ${client.prenom} ${client.nom} pour votre commande !`;
        document.getElementById("recap").innerHTML = `
            <p>Un email de confirmation a été envoyé à l'adresse mail suivante : ${client.email}</p><br>
            <p>Adresse : ${client.adresse}</p> <br>
            <p>Transaction ID : <strong>${transactionId}</strong></p> <br>
            <h2>Détail de la commande :</h2>
            <ul class="produits-list">
                ${produits.map(p => `
                    <li class="produit-item">
                        <img src="${p.image}" alt="${p.nom}" class="produit-img">
                        <div class="produit-details">
                            <strong>${p.nom}</strong>
                            <p>Quantité : ${p.quantite}</p>
                            <p>Prix unitaire : ${parseFloat(p.prix).toFixed(2)} €</p>
                        </div>
                    </li>
                `).join('')}
                    <li> <p> <strong> Prix Livraison : ${prixLivraison} € </li></p></strong>
            </ul>
            <h3>Total payé : ${parseFloat(total).toFixed(2)} €</h3>
        `;

        localStorage.removeItem("orderClient");
        localStorage.removeItem("orderProduits");
        localStorage.removeItem("orderTotal");
        localStorage.removeItem("orderTransactionId");
        localStorage.removeItem("orderId");
    } else {
        document.getElementById("recap").innerHTML = "<p>Aucune donnée de commande trouvée.</p>";
    }
});

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