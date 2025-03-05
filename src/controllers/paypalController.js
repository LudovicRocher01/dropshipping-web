const fetch = require('node-fetch');
require('dotenv').config();

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = process.env.PAYPAL_ENV === "live"
  ? "https://api.paypal.com"
  : "https://api.sandbox.paypal.com";

async function getAccessToken() {
    const auth = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64')}`,
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials"
    });

    const authData = await auth.json();
    if (!auth.ok) throw new Error("Erreur d'authentification PayPal");
    return authData.access_token;
}

exports.createOrder = async (req, res) => {
    try {
        const { total } = req.body;
        if (!total || isNaN(total)) {
            return res.status(400).json({ error: "Montant invalide" });
        }

        const accessToken = await getAccessToken();

        const order = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                intent: "CAPTURE",
                purchase_units: [{
                    amount: { currency_code: "EUR", value: total.toFixed(2) }
                }]
            })
        });

        const orderData = await order.json();
        if (!order.ok) throw new Error("Erreur lors de la création de la commande");

        res.json({ orderID: orderData.id });
    } catch (error) {
        console.error("❌ Erreur PayPal :", error);
        res.status(500).json({ error: "Erreur lors de la création du paiement" });
    }
};
