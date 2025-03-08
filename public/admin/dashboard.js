async function verifierAuth() {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        window.location.href = "index.html";
        return;
    }

    try {
        const response = await fetch("/api/auth/verify", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Authentification invalide");
        }
    } catch (error) {
        sessionStorage.removeItem("adminToken");
        window.location.href = "index.html";
    }
}

async function chargerProduits() {
    try {
        const response = await fetch("/api/produits");
        const produits = await response.json();

        const tableBody = document.getElementById("produits-table");
        tableBody.innerHTML = "";

        produits.forEach(produit => {
            const row = document.createElement("tr");
            const imageUrl = produit.image_url ? produit.image_url : "images/no-image.png";

            row.innerHTML = `
                <td>${produit.id}</td>
                <td>
                    <img src="${imageUrl}" width="50" height="50" style="border-radius: 5px;">
                    <button onclick="toggleFileInput(${produit.id})">Changer d'image</button>
                    <input type="file" id="image-${produit.id}" data-current-image="${produit.image_url}" style="display: none;">
                </td>
                <td><input type="text" value="${produit.categorie}" disabled></td>
                <td><input type="text" value="${produit.nom}" id="nom-${produit.id}"></td>
                <td><input type="text" value="${produit.description}" id="desc-${produit.id}"></td>
                <td>
                    ${produit.categorie === "spray" 
                    ? `<input type="number" step="0.01" value="${produit.prix}" id="prix-${produit.id}">`
                    : "-"}
                </td>
                <td>
                    ${produit.categorie === "spray" || produit.categorie === "conference"
                    ? "-"
                    : `<input type="text" value="${produit.lien_achat}" id="lien-${produit.id}">`}
                </td>
                <td>
                    <button onclick="modifierProduit(${produit.id})">Modifier</button>
                    <button onclick="supprimerProduit(${produit.id})" style="color:red;">Supprimer</button>
                </td>
            `;

            document.getElementById("produits-table").appendChild(row);
        });
        
    } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
    }
}



function toggleFileInput(id) {
    const fileInput = document.getElementById(`image-${id}`);
    fileInput.style.display = fileInput.style.display === "none" ? "block" : "none";
}

async function modifierProduit(id) {
    const nom = document.getElementById(`nom-${id}`).value;
    const description = document.getElementById(`desc-${id}`).value;
    const prixElement = document.getElementById(`prix-${id}`);
    const lienAchatElement = document.getElementById(`lien-${id}`);
    const imageInput = document.getElementById(`image-${id}`).files[0];
    const currentImage = document.getElementById(`image-${id}`).dataset.currentImage;

    const categorie = document.querySelector(`tr td:nth-child(3) input[disabled]`).value;

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("description", description);
    formData.append("categorie", categorie);

    // Ajout des valeurs uniquement si elles existent
    if (prixElement) {
        formData.append("prix", prixElement.value);
    }
    if (lienAchatElement) {
        formData.append("lien_achat", lienAchatElement.value);
    }

    if (imageInput) {
        formData.append("image", imageInput);
    } else {
        formData.append("image_url", currentImage);
    }

    try {
        await fetch(`/api/produits/${id}`, {
            method: "PUT",
            body: formData
        });

        alert("Produit mis à jour !");
        chargerProduits();
    } catch (error) {
        console.error("Erreur lors de la modification du produit :", error);
    }
}



async function supprimerProduit(id) {
    if (!confirm("Voulez-vous vraiment supprimer ce produit ?")) return;

    try {
        await fetch(`/api/produits/${id}`, { method: "DELETE" });

        alert("Produit supprimé !");
        chargerProduits();
    } catch (error) {
        console.error("Erreur lors de la suppression du produit :", error);
    }
}

document.getElementById("add-product-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const selectedCategory = document.getElementById("categorie").value;
    const formData = new FormData();
    formData.append("nom", document.getElementById("nom").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("image", document.getElementById("image").files[0]);
    formData.append("categorie", selectedCategory);

    if (selectedCategory !== "conference") {
        formData.append("prix", document.getElementById("prix").value);
        formData.append("lien_achat", document.getElementById("lien_achat").value);
    }

    try {
        const response = await fetch("/api/produits", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            throw new Error("Erreur lors de l'ajout du produit.");
        }

        alert("Produit ajouté !");
        chargerProduits();
        document.getElementById("add-product-form").reset();
        mettreAJourFormulaire();
    } catch (error) {
        console.error("Erreur lors de l'ajout du produit :", error);
    }
});


async function chargerCommandes() {
    try {
        const response = await fetch("/api/commandes");
        const commandes = await response.json();

        const commandesTable = document.getElementById("commandes-table");
        commandesTable.innerHTML = "";

        commandes.forEach(commande => {
            const row = document.createElement("tr");

            let produits;
            try {
                produits = JSON.parse(commande.order_details);
            } catch (parseError) {
                console.error("Erreur de parsing pour order_details :", parseError);
                produits = [];
            }
            let produitsHTML = "<ul>";
            produits.forEach(produit => {
                produitsHTML += `<li>${produit.nom} (x${produit.quantite}) - ${parseFloat(produit.prix).toFixed(2)} €</li>`;
            });
            produitsHTML += "</ul>";

            const adresseAffichee = commande.adresse === "Retrait au cabinet" ? "Retrait au cabinet" : commande.adresse;

            const dateObj = new Date(commande.created_at);

            const day = ("0" + dateObj.getDate()).slice(-2);
            const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
            const year = dateObj.getFullYear();

            const hours = ("0" + dateObj.getHours()).slice(-2);
            const minutes = ("0" + dateObj.getMinutes()).slice(-2);
            const seconds = ("0" + dateObj.getSeconds()).slice(-2);

            const dateFormatted = `${day}/${month}/${year}`;
            const timeFormatted = `${hours}h${minutes}m${seconds}s`;

            row.innerHTML = `
                <td>${commande.transaction_id}</td>
                <td>${commande.prenom} ${commande.nom}</td>
                <td>${commande.email}</td>
                <td>${adresseAffichee}</td>
                <td> ${dateFormatted} <br>
                ${timeFormatted} </td>
                <td>${produitsHTML}</td>
                <td>${parseFloat(commande.total).toFixed(2)} €</td>
                <td><button onclick="supprimerCommande(${commande.id})" class="delete-btn">Archiver</button></td>
            `;
            commandesTable.appendChild(row);
        });
    } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
    }
}

async function supprimerCommande(id) {
    if (!confirm("Êtes-vous sûr de vouloir archiver cette commande ?")) {
        return;
    }
    try {
        const response = await fetch(`/api/commandes/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erreur inconnue");
        }

        alert(data.message || "Commande archivée !");
        chargerCommandes();
    } catch (error) {
        console.error("Erreur lors de l'archivage :", error);
        alert("Erreur lors de l'archivage de la commande.");
    }
}

async function chargerShippingFee() {
    try {
      const response = await fetch('/api/settings/shipping_fee');
      const data = await response.json();
      if (data.setting) {
        document.getElementById("shipping_fee").value = parseFloat(data.setting);
      }
    } catch (error) {
        console.error("Erreur lors du chargement des frais de port :", error);
    }
}

function mettreAJourFormulaire() {
    const selectedCategory = document.getElementById('categorie').value;
    const priceField = document.getElementById('price-field');
    const linkField = document.getElementById('link-field');

    if (selectedCategory === 'spray') {
        linkField.style.display = 'none';
        priceField.style.display = 'block';
    } else if (selectedCategory === 'conference') {
        linkField.style.display = 'none';
        priceField.style.display = 'none';
    } else {
        linkField.style.display = 'block';
        priceField.style.display = 'none';
    }
}

async function chargerPreinscriptions(conferenceId = "") {
    try {
        const response = await fetch("/api/formulaires");
        let preinscriptions = await response.json();

        if (conferenceId) {
            preinscriptions = preinscriptions.filter(p => p.conference_id == conferenceId);
        }

        const tableBody = document.getElementById("preinscriptions-table");
        tableBody.innerHTML = "";

        preinscriptions.forEach(preinscrit => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${preinscrit.nom}</td>
                <td>${preinscrit.prenom}</td>
                <td>${preinscrit.email}</td>
                <td>${preinscrit.telephone}</td>
                <td>${preinscrit.conference_nom}</td>
                <td>${new Date(preinscrit.date_inscription).toLocaleString()}</td>
            <td><button onclick="supprimerPreinscription(${preinscrit.id})" style="color:red;">🗑️ Supprimer</button></td>            `;

            tableBody.appendChild(row);
        });
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    chargerPreinscriptions();
});

async function supprimerPreinscription(id) {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette personne de la conférence ?")) {
        return;
    }

    try {
        const response = await fetch(`/api/formulaires/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Erreur lors de la suppression");
        }

        alert("Pré-inscription supprimée avec succès !");
        chargerPreinscriptions()
    } catch (error) {
        console.error("Erreur lors de la suppression :", error);
    }
}


verifierAuth();
chargerProduits();
chargerShippingFee();

document.getElementById("logout").addEventListener("click", function () {
    sessionStorage.removeItem("adminToken");
    window.location.href = "index.html";
});

document.getElementById("show-orders").addEventListener("click", function () {
    const section = document.getElementById("commandes-section");
    section.style.display = section.style.display === "none" ? "block" : "none";
    if (section.style.display === "block") {
        chargerCommandes();
    }
});

document.getElementById("show-preinscriptions").addEventListener("click", function () {
    const section = document.getElementById("preinscriptions-section");
    section.style.display = section.style.display === "none" ? "block" : "none";

    if (section.style.display === "block") {
        chargerPreinscriptions();
    }
});


document.getElementById("update-shipping").addEventListener("click", async () => {
    const newFee = document.getElementById("shipping_fee").value;
    try {
      const response = await fetch('/api/settings/shipping_fee', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting_value: newFee })
      });
      const data = await response.json();
      if (data.message) {
        alert("Frais de port mis à jour avec succès !");
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des frais de port :", error);
      alert("Erreur lors de la mise à jour.");
    }
  });
  
  document.addEventListener("DOMContentLoaded", function () {
    mettreAJourFormulaire();
});

document.getElementById('categorie').addEventListener('change', mettreAJourFormulaire);