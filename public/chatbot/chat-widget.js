document.addEventListener("DOMContentLoaded", () => {
    const chatButton = document.createElement("div");
    chatButton.id = "chat-toggle";
    chatButton.innerHTML = "💬";
    document.body.appendChild(chatButton);
  
    const chatBox = document.createElement("div");
    chatBox.id = "chat-box";
    chatBox.innerHTML = `
      <div id="chat-header">🤖 Osteozen <span id="chat-close">×</span></div>
      <div id="chat-messages"></div>
      <form id="chat-form">
        <input type="text" id="chat-input" placeholder="Posez votre question..." autocomplete="off" required />
        <button type="submit">Envoyer</button>
      </form>
      <div id="chat-footer">
      <button id="chat-clear">🗑 Effacer</button>
      </div>
    `;
    document.body.appendChild(chatBox);
  
    const toggle = document.getElementById("chat-toggle");
    const box = document.getElementById("chat-box");
    const close = document.getElementById("chat-close");
    const form = document.getElementById("chat-form");
    const input = document.getElementById("chat-input");
    const messages = document.getElementById("chat-messages");
    const clear = document.getElementById("chat-clear");
    clear.addEventListener("click", () => {
      localStorage.removeItem("chatHistory");
      messages.innerHTML = "";
    });

  
    toggle.addEventListener("click", () => {
      box.classList.toggle("open");
    });
  
    close.addEventListener("click", () => {
      box.classList.remove("open");
    });
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const userMessage = input.value.trim();
      if (!userMessage) return;
  
      appendMessage("Vous", userMessage);
      input.value = "";
      appendMessage("Osteozen", "⏳ ...", false);
  
      try {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage })
        });
  
        const data = await res.json();
        messages.lastChild.remove();
        appendMessage("Osteozen", data.reply);
      } catch (err) {
        messages.lastChild.remove();
        appendMessage("Osteozen", "❌ Une erreur est survenue.");
      }
    });
  
    function appendMessage(sender, text, save = true) {
      const msg = document.createElement("div");
      msg.className = `chat-message ${sender === "Vous" ? "user" : "bot"}`;
      msg.innerHTML = `<strong>${sender} :</strong> ${text}`;
      messages.appendChild(msg);
      messages.scrollTop = messages.scrollHeight;
    
      if (save) {
        const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
        history.push({ sender, text });
        localStorage.setItem("chatHistory", JSON.stringify(history));
      }
    }
    

    function loadChatHistory() {
      const messages = JSON.parse(localStorage.getItem("chatHistory")) || [];
      messages.forEach(({ sender, text }) => appendMessage(sender, text, false));
    }    

    loadChatHistory();

    const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];

    if (chatHistory.length === 0) {
      appendMessage("Osteozen", "Bonjour, je suis coach Osteozen et je me charge de répondre à toutes vos questions sur les entorses, les tendinites ou tout autre problème de santé qui nécessite de la kinésithérapie.", false);
    }
  });
  