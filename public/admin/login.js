document.getElementById("login-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error);
        }

        sessionStorage.setItem("adminToken", data.token); // Stocker le token JWT
        window.location.href = "dashboard.html"; // Rediriger vers le tableau de bord
    } catch (error) {
        document.getElementById("error-message").textContent = error.message;
        document.getElementById("error-message").style.display = "block";
    }
});
