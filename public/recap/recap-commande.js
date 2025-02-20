document.addEventListener("DOMContentLoaded", () => {
    const client = JSON.parse(sessionStorage.getItem("orderClient"));
    const produits = JSON.parse(sessionStorage.getItem("orderProduits"));
    const total = sessionStorage.getItem("orderTotal");
    const transactionId = sessionStorage.getItem("orderTransactionId");

    if (client) {
        document.getElementById("remerciement").textContent = `Merci ${client.prenom} ${client.nom} pour votre commande !`;
        document.getElementById("recap").innerHTML = `
            <p>Email : ${client.email}</p>
            <p>Adresse : ${client.adresse}</p>
            <p>Transaction ID : <strong>${transactionId}</strong></p>
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
            </ul>
            <h3>Total payé : ${parseFloat(total).toFixed(2)} €</h3>
        `;
    } else {
        document.getElementById("recap").innerHTML = "<p>Aucune donnée de commande trouvée.</p>";
    }
});
