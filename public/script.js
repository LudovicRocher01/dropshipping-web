function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes("health_products.html")) return "sante";
    if (path.includes("books.html")) return "livre";
    if (path.includes("conferences.html")) return "conference";
    if (path.includes("sprays.html")) return "spray";
    return "accueil";
}

function getActionButton(produit) {
    if (produit.categorie === "livre" || produit.categorie === "sante") {
        return `<a href="${produit.lien_achat}" target="_blank">
                    <i class="material-icons">add_shopping_cart</i>
                </a>`;
    } else if (produit.categorie === "spray" && produit.prix) {
        return `<span style="font-size: 1.1rem; font-weight: bold; color: #4CAF50;">${parseFloat(produit.prix).toFixed(2)} €</span>`;
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
            container.innerHTML = "<p class='tile'>Aucun produit disponible.</p>";
            return;
        }
        produitsFiltres.forEach(produit => {
            const wrapper = document.createElement("div");
            wrapper.classList.add("wrapper", "produit");


            const actionButton = getActionButton(produit);

            wrapper.innerHTML = `
                <div class="container">
                    <div class="top product-img" style="background-image: url('${produit.image_url}')">
                    </div>
                    <div class="bottom">
                        <div class="left">
                            <div class="details">
                                <h1>${produit.nom}</h1>
                                ${getAudioPlayer(produit)}
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

        document.querySelectorAll('.icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
        
                const contenuInfo = e.currentTarget.nextElementSibling;
                contenuInfo.classList.toggle('visible');
            });
        });

        document.addEventListener('click', (e) => {
            document.querySelectorAll('.contents.visible').forEach(contenuInfo => {
                if (!contenuInfo.closest('.inside').contains(e.target)) {
                    contenuInfo.classList.remove('visible');
                }
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

async function chargerConferences() {
    try {
        const response = await fetch('/api/produits');
        const produits = await response.json();

        const conferences = produits.filter(prod => prod.categorie === "conference");

        const container = document.getElementById("conferences-container");
        container.innerHTML = "";

        if (conferences.length === 0) {
            container.innerHTML = "<p class='tile'>Aucune conférence disponible.</p>";
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
    
            if (!response.ok) {
                throw new Error(result.error || "Une erreur est survenue.");
            }
    
            document.getElementById("confirmation-message").textContent = "🎉 Pré-inscription enregistrée avec succès !";
            document.getElementById("confirmation-modal").style.display = "block";
            
            fermerModal();
        } catch (error) {
            console.error("Erreur lors de l'envoi :", error);
            showToast(`❌ ${error.message}`);
        }
    });
    
    document.getElementById("close-confirmation").addEventListener("click", function () {
        document.getElementById("confirmation-modal").style.display = "none";
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

function getAudioPlayer(produit) {
    const src = audioMap[produit.id];
    if (produit.categorie === "livre" && src) {
      return `
        <div class="audio-player">
          <audio controls preload="none">
            <source src="${src}" type="audio/mpeg">
            Votre navigateur ne supporte pas la balise audio.
          </audio>
        </div>
      `;
    }
    return "";
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

    const dreamTile = document.getElementById("dream-machine-tile");
    const lightbox = document.getElementById("lightbox-modal");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".close-lightbox");

    if (dreamTile && lightbox && lightboxImg) {
        dreamTile.addEventListener("click", (e) => {
            e.preventDefault();
            const imgSource = dreamTile.querySelector("img").src;
            
            lightbox.style.display = "block";
            lightboxImg.src = imgSource;
        });

        closeBtn.addEventListener("click", () => {
            lightbox.style.display = "none";
        });

        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                lightbox.style.display = "none";
            }
        });
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const retraitCheckbox = document.getElementById("retraitMagasin");
    
    if (retraitCheckbox) {
        retraitCheckbox.addEventListener("change", async () => {
            localStorage.setItem("retraitMagasin", retraitCheckbox.checked.toString());
            await afficherPanier();
        });

        retraitCheckbox.checked = localStorage.getItem("retraitMagasin") === "true";
    }
});

fetch("/composants/navbar.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("navbar-container").innerHTML = html;

    const isIndex = window.location.pathname.endsWith("/") || window.location.pathname.endsWith("index.html");
    const pageTitle = document.getElementById("page-title");

    const vincent = document.querySelector(".nav-identity");
    if (!isIndex && vincent) vincent.style.display = "none";

    const homeIcon = document.getElementById("home-icon");
    if (isIndex && homeIcon) homeIcon.style.display = "none";

    if (pageTitle) {
      if (window.location.pathname.includes("books.html")) {
        pageTitle.innerHTML = '<i class="fas fa-book"></i> Mes livres';
      } else if (window.location.pathname.includes("health_products.html")) {
        pageTitle.innerHTML = '<i class="fas fa-heartbeat"></i> Les produits de santé';
      } else if (window.location.pathname.includes("conferences.html")) {
        pageTitle.innerHTML = '<i class="fas fa-graduation-cap"></i> Conférences et formations';
      } else if (window.location.pathname.includes("sprays.html")) {
        pageTitle.innerHTML = '<i class="fas fa-air-freshener"></i> Sprays d\'ambiance';
      }
    }
  });


fetch('/composants/footer.html')
.then(response => response.text())
.then(data => {
    document.getElementById('footer-container').innerHTML = data;
});

document.addEventListener("DOMContentLoaded", async () => {
    const footerContainer = document.getElementById("footer-container");
    if (footerContainer) {
        try {
            const response = await fetch("composants/footer.html")
            if (!response.ok) throw new Error("Impossible de charger le footer.");
            footerContainer.innerHTML = await response.text();
            attacherEvenementsFooter();
        } catch (error) {
            console.error("Erreur lors du chargement du footer :", error);
        }
    }
});

function attacherEvenementsFooter() {
    const contactBtn = document.getElementById("contact-btn");
    const contactModal = document.getElementById("contact-modal");
    const closeModal = document.querySelector(".modal .close-contact");

    if (!contactBtn || !contactModal || !closeModal) {
        console.error("Un élément du footer est introuvable !");
        return;
    }

    contactBtn.addEventListener("click", () => {
        contactModal.style.display = "block";
    });

    closeModal.addEventListener("click", () => {
        contactModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === contactModal) {
            contactModal.style.display = "none";
        }
    });
}

const audioMap = {
    48: "/media/audio/podcast_face_cachee_ame.mp3",
    50: "/media/audio/podcast_face_cachee_etre.mp3",
    66: "/media/audio/podcast_mascarade.mp3",
    75: "/media/audio/podcast_face_cachee_realite.mp3",
  };