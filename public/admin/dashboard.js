async function verifierAuth() {
    const token = sessionStorage.getItem("adminToken");

    if (!token) {
        window.location.href = "login.html";
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
        window.location.href = "login.html";
    }
}

// Vérifier l'authentification dès le chargement
verifierAuth();



// Déconnexion
document.getElementById("logout").addEventListener("click", function () {
    sessionStorage.removeItem("adminToken"); // Supprime le token
    window.location.href = "login.html"; // Redirige vers la page de connexion
});


// Fonction pour charger les produits
async function chargerProduits() {
    try {
        const response = await fetch("/api/produits");
        const produits = await response.json();

        const tableBody = document.getElementById("produits-table");
        tableBody.innerHTML = ""; // Efface le contenu actuel

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
                <td><input type="text" value="${produit.categorie}" disabled></td> <!-- Catégorie non modifiable -->
                <td><input type="text" value="${produit.nom}" id="nom-${produit.id}"></td>
                <td><input type="text" value="${produit.description}" id="desc-${produit.id}"></td>
                <td><input type="number" step="0.01" value="${produit.prix}" id="prix-${produit.id}"></td>
                <td><input type="text" value="${produit.lien_achat}" id="lien-${produit.id}" ${produit.categorie === "spray" ? 'style="display:none;"' : ''}></td>
                <td>
                    ${produit.categorie === "spray" 
                    ? `<input type="number" value="${produit.quantite}" id="quantite-${produit.id}" min="0">` 
                    : ''}
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


// Fonction pour afficher/masquer l'input file pour changer l'image
function toggleFileInput(id) {
    const fileInput = document.getElementById(`image-${id}`);
    fileInput.style.display = fileInput.style.display === "none" ? "block" : "none";
}


// Fonction pour modifier un produit
async function modifierProduit(id) {
    const nom = document.getElementById(`nom-${id}`).value;
    const description = document.getElementById(`desc-${id}`).value;
    const prix = document.getElementById(`prix-${id}`).value;
    const lien_achat = document.getElementById(`lien-${id}`) ? document.getElementById(`lien-${id}`).value : ""; // Vérifie si le champ existe
    const quantiteField = document.getElementById(`quantite-${id}`);
    const quantite = quantiteField ? quantiteField.value : null;  // Si c'est un spray, on récupère la quantité
    const imageInput = document.getElementById(`image-${id}`).files[0];
    const currentImage = document.getElementById(`image-${id}`).dataset.currentImage; 

    // Récupérer la catégorie depuis la ligne du tableau (comme elle n'est pas modifiable)
    const categorie = document.querySelector(`tr td:nth-child(3) input[disabled]`).value;  // Récupérer la catégorie directement

    const formData = new FormData();
    formData.append("nom", nom);
    formData.append("description", description);
    formData.append("prix", prix);
    formData.append("lien_achat", lien_achat);
    formData.append("categorie", categorie); // On envoie toujours la catégorie même si elle n'est pas modifiée
    if (quantite !== null) formData.append("quantite", quantite); // Ajout de la quantité uniquement pour les sprays

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


// Fonction pour supprimer un produit
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

// Fonction pour ajouter un produit
// Fonction pour ajouter un produit avec image
document.getElementById("add-product-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("nom", document.getElementById("nom").value);
    formData.append("description", document.getElementById("description").value);
    formData.append("prix", document.getElementById("prix").value);
    formData.append("lien_achat", document.getElementById("lien_achat").value);
    formData.append("categorie", document.getElementById("categorie").value);
    formData.append("image", document.getElementById("image").files[0]);
    formData.append("quantite", document.getElementById("quantite").value);

    try {
        const response = await fetch("/api/produits", {
            method: "POST",
            body: formData // Envoi correct des données avec image
        });

        if (!response.ok) {
            throw new Error("Erreur lors de l'ajout du produit.");
        }

        alert("Produit ajouté !");
        chargerProduits(); // Rafraîchir la liste des produits
        document.getElementById("add-product-form").reset(); // Réinitialiser le formulaire
    } catch (error) {
        console.error("Erreur lors de l'ajout du produit :", error);
    }
});


// Charger les produits au chargement de la page
chargerProduits();

// Afficher/Masquer la section des commandes
document.getElementById("show-orders").addEventListener("click", function () {
    const section = document.getElementById("commandes-section");
    section.style.display = section.style.display === "none" ? "block" : "none";
    if (section.style.display === "block") {
        chargerCommandes();
    }
});

// Fonction pour récupérer et afficher les commandes
async function chargerCommandes() {
    try {
        const response = await fetch("/api/commandes");
        const commandes = await response.json();

        const commandesTable = document.getElementById("commandes-table");
        commandesTable.innerHTML = ""; // Nettoyer le tableau

        commandes.forEach(commande => {
            const row = document.createElement("tr");

            // Parse order_details
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

            // Vérifier si l'adresse est "Retrait au cabinet"
            const adresseAffichee = commande.adresse === "Retrait au cabinet" ? "Retrait au cabinet" : commande.adresse;

            row.innerHTML = `
                <td>${commande.id}</td>
                <td>${commande.prenom} ${commande.nom}</td>
                <td>${commande.email}</td>
                <td>${adresseAffichee}</td>
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


// Fonction pour archiver une commande
async function supprimerCommande(id) {
    if (!confirm("Êtes-vous sûr de vouloir archiver cette commande ?")) {
        return;
    }
    try {
        const response = await fetch(`/api/commandes/${id}`, {
            method: "DELETE"
        });
        const data = await response.json();
        alert(data.message);
        chargerCommandes(); // Rafraîchir la liste des commandes
    } catch (error) {
        console.error("Erreur lors de la suppression de la commande :", error);
        alert("Une erreur est survenue lors de la suppression de la commande.");
    }
}

// 📌 Charger les commandes au chargement de la page
document.addEventListener("DOMContentLoaded", chargerCommandes);


// Fonction pour récupérer les frais de port depuis le serveur et les afficher dans le champ
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
  
  // Fonction pour mettre à jour les frais de port sur le serveur
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
        // Vous pouvez actualiser l'affichage du panier si nécessaire
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour des frais de port :", error);
      alert("Erreur lors de la mise à jour.");
    }
  });
  
  // Charger les frais de port au chargement du DOM
  document.addEventListener("DOMContentLoaded", () => {
    chargerShippingFee();
  });

  document.getElementById('categorie').addEventListener('change', function() {
    const selectedCategory = this.value;
    const linkField = document.getElementById('link-field');
    const quantiteField = document.getElementById('quantite-field');

    if (selectedCategory === 'spray') {
        linkField.style.display = 'none';  // Masquer le champ pour les sprays
        quantiteField.style.display = 'block';
    } else {
        linkField.style.display = 'block'; // Afficher le champ pour les autres catégories
        quantiteField.style.display = 'none';
    }
});

  