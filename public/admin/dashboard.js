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

        if (!Array.isArray(produits)) {
            console.warn("Réponse inattendue pour les produits :", produits);
            return;
        }

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
                    ${produit.categorie === "conference"
                    ? "-"
                    : `<input type="text" value="${produit.lien_achat || ''}" id="lien-${produit.id}">`}
                </td>
                <td><input type="number" value="${produit.ordre || 0}" id="ordre-${produit.id}" style="width: 60px;"></td>
                <td>
                    <button onclick="modifierProduit(${produit.id})">Modifier</button>
                    <button onclick="supprimerProduit(${produit.id})" style="color:red;">Supprimer</button>
                </td>
            `;
            tableBody.appendChild(row);
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
    const ordreElement = document.getElementById(`ordre-${id}`);
    const lienAchatElement = document.getElementById(`lien-${id}`);
    const imageInput = document.getElementById(`image-${id}`).files[0];
    const currentImage = document.getElementById(`image-${id}`).dataset.currentImage;

    const categorie = document.querySelector(`tr td:nth-child(3) input[disabled]`).value;

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("description", description);
    formData.append("categorie", categorie);

    if (prixElement) {
        formData.append("prix", prixElement.value);
    }
    if (lienAchatElement) {
        formData.append("lien_achat", lienAchatElement.value);
    }
    formData.append("ordre", ordreElement.value);

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

    const token = sessionStorage.getItem("adminToken");
    const selectedCategory = document.getElementById("categorie").value;
    const formData = new FormData();
    formData.append("nom", document.getElementById("nom").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("image", document.getElementById("image").files[0]);
    formData.append("categorie", selectedCategory);

    const lienInput = document.getElementById("lien_achat");
    if (selectedCategory !== "conference" && lienInput) {
        formData.append("lien_achat", lienInput.value);
    }

    try {
        const response = await fetch("/api/produits", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Erreur lors de l'ajout du produit.");
        }

        alert("Produit ajouté !");
        chargerProduits();
        document.getElementById("add-product-form").reset();
        mettreAJourFormulaire();
    } catch (error) {
        console.error("Erreur lors de l'ajout du produit :", error);
        alert(error.message);
    }
});

function mettreAJourFormulaire() {
    const selectedCategory = document.getElementById('categorie').value;
    const linkField = document.getElementById('link-field');

    if (linkField) {
        linkField.style.display = (selectedCategory === 'conference') ? 'none' : 'block';
    }
}

async function chargerPreinscriptions(conferenceId = "") {
    const token = sessionStorage.getItem("adminToken");
    try {
        const response = await fetch("/api/formulaires", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        const preinscriptions = await response.json();

        if (!Array.isArray(preinscriptions)) {
            console.warn("Réponse inattendue formulaires :", preinscriptions);
            return;
        }

        let liste = preinscriptions;
        if (conferenceId) {
            liste = liste.filter(p => p.conference_id == conferenceId);
        }

        const tableBody = document.getElementById("preinscriptions-table");
        tableBody.innerHTML = "";

        liste.forEach(preinscrit => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${preinscrit.nom}</td>
                <td>${preinscrit.prenom}</td>
                <td>${preinscrit.email}</td>
                <td>${preinscrit.telephone}</td>
                <td>${preinscrit.conference_nom || "-"}</td>
                <td>${new Date(preinscrit.date_inscription).toLocaleString()}</td>
                <td><button onclick="supprimerPreinscription(${preinscrit.id})" style="color:red;">🗑️ Supprimer</button></td>
            `;
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

document.getElementById("logout").addEventListener("click", function () {
    sessionStorage.removeItem("adminToken");
    window.location.href = "index.html";
});

document.getElementById("show-preinscriptions").addEventListener("click", function () {
    const section = document.getElementById("preinscriptions-section");
    section.style.display = section.style.display === "none" ? "block" : "none";

    if (section.style.display === "block") {
        chargerPreinscriptions();
    }
});

  
  document.addEventListener("DOMContentLoaded", function () {
    mettreAJourFormulaire();
});

document.getElementById('categorie').addEventListener('change', mettreAJourFormulaire);