document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.getElementById("sprays-grid");

    try {
        const response = await fetch("/api/produits");
        const produits = await response.json();

        if (!Array.isArray(produits)) {
            console.error("Réponse invalide :", produits);
            return;
        }

        const sprays = produits.filter(p => p.categorie === "spray");

        if (sprays.length === 0) {
            grid.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Aucun spray disponible pour le moment.</p>";
            return;
        }

        grid.innerHTML = "";
        sprays.forEach(spray => {
            const card = document.createElement("div");
            card.className = "product-card";

            const prixAffichage = spray.prix ? `${parseFloat(spray.prix).toFixed(2)} €` : "";

            card.innerHTML = `
                <img src="${spray.image_url}" alt="${spray.nom}" class="product-image">
                <div class="product-info">
                    <h3 class="product-title">${spray.nom}</h3>
                    <p class="product-description">${spray.description}</p>
                    ${prixAffichage ? `<span class="product-price">${prixAffichage}</span>` : ""}
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des sprays :", error);
    }
});