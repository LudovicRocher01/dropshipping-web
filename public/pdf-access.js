async function verifierCode() {
    const code = document.getElementById("accessCode").value.trim();

    if (!code) {
        alert("Veuillez entrer un code valide !");
        return;
    }

    try {
        const response = await fetch(`/api/pdf/${code}`);
        if (response.ok) {
            window.location.href = `/api/pdf/${code}`;
        } else {
            alert("Code invalide ou expiré !");
        }
    } catch (error) {
        console.error("Erreur de vérification du code :", error);
        alert("Une erreur est survenue.");
    }
}

paypal.Buttons({
    createOrder: async function (data, actions) {
        try {
            const response = await fetch("/api/paypal/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ total: 10 })
            });

            const data = await response.json();
            return data.orderID;
        } catch (error) {
            console.error("Erreur PayPal :", error);
            alert("Une erreur est survenue.");
        }
    },

    onApprove: function (data, actions) {
        return actions.order.capture().then(async function (details) {
            const clientEmail = details.payer.email_address;
            const transactionId = details.id;

            const response = await fetch("/api/pdf/generate-code", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: clientEmail, transactionId })
            });

            const result = await response.json();

            document.body.innerHTML = `
                <div class="container">
                    <h1>🎉 Paiement validé !</h1>
                    <p>Merci pour votre achat. Votre code d'accès a été envoyé à : <strong>${clientEmail}</strong></p>
                    <h3>Votre code : <span style="color: #4CAF50;">${result.code}</span></h3>
                    <p>Utilisez ce code sur <a href="https://osteozen.net/pdf-access.html">cette page</a> pour accéder au PDF.</p>
                </div>
            `;
        });
    }
}).render("#paypal-button-container");
