document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.createElement("div");
  chatButton.id = "chat-toggle";
  chatButton.innerHTML = `
    <span class="chat-button-text">Coach Kiné</span>
    <img src="/images/coach_kine.jpg" alt="Coach Kiné" class="chat-avatar" />
    <span id="chat-notification" class="chat-notification-bubble">1</span>
  `;
  document.body.appendChild(chatButton);

  const chatBox = document.createElement("div");
  chatBox.id = "chat-box";
  chatBox.innerHTML = `
  <div id="chat-header">
  <div class="chat-title">
    <img src="/images/coach_kine.jpg" alt="Coach Kiné" class="chat-avatar" />
    <span>Mon coach Kiné</span>
  </div>
  <span id="chat-close">×</span>
</div>
    <div id="chat-messages"></div>

    <form id="chat-form-upload" enctype="multipart/form-data">
      <input type="text" id="chat-input-upload" placeholder="Posez votre question..." autocomplete="off" required />
      <input type="file" id="chat-file-upload"" />
      <button type="submit">📎 Envoyer</button>
    </form>

    <div id="chat-footer">
      <button id="chat-clear">🗑 Effacer</button>
    </div>
  `;
  document.body.appendChild(chatBox);

  const toggle = document.getElementById("chat-toggle");
  const box = document.getElementById("chat-box");
  const close = document.getElementById("chat-close");
  const messages = document.getElementById("chat-messages");
  const clear = document.getElementById("chat-clear");

  clear.addEventListener("click", () => {
    localStorage.removeItem("chatHistory");
    messages.innerHTML = "";
    appendMessage("Coach Kiné", "Bonjour, je suis coach Kiné, assistant virtuel de Vincent. Je ne remplace pas une consultation  mais je peux répondre à pas mal de vos questions. On discute ?", false);
  });

  const notif = document.getElementById("chat-notification");
  
  if (box.classList.contains("open")) {
    notif.style.display = "none";
  } else {
    notif.style.display = "flex";
  }

  toggle.addEventListener("click", () => {
    box.classList.toggle("open");
    if (box.classList.contains("open")) {
      localStorage.setItem("chatClosed", "false");
      notif.style.display = "none";
    }
  });

  close.addEventListener("click", () => {
    box.classList.remove("open");
    localStorage.setItem("chatClosed", "true");
  });

  const unifiedForm = document.getElementById("chat-form-upload");
  const unifiedInput = document.getElementById("chat-input-upload");
  const unifiedFile = document.getElementById("chat-file-upload");

  unifiedForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageText = unifiedInput.value.trim();
    const file = unifiedFile.files[0];
    if (!messageText) return;

    const fileLabel = file ? ` (📎 ${file.name})` : "";
    appendMessage("Vous", messageText + fileLabel);
    unifiedInput.value = "";
    unifiedFile.value = "";
    appendMessage("Coach Kiné", "⏳ Traitement en cours...", false);

    try {
      if (file) {
        const formData = new FormData();
        formData.append("message", messageText);
        formData.append("document", file);
  
        const imageFormats = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
  
        const route = imageFormats.includes(file.type)
          ? "/api/chatbotImage"
          : "/api/chatbotfile";
  
        const res = await fetch(route, {
          method: "POST",
          body: formData
        });

        const data = await res.json();
        messages.lastChild.remove();
        appendMessage("Coach Kiné", data.reply || "Réponse vide.");
      } else {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText })
        });

        const data = await res.json();
        messages.lastChild.remove();
        appendMessage("Coach Kiné", data.reply || "Réponse vide.");
      }
    } catch (err) {
      messages.lastChild.remove();
      console.error(err);
      appendMessage("Coach Kiné", "❌ Une erreur est survenue lors du traitement de votre demande.");
    }

    unifiedInput.value = "";
    unifiedFile.value = "";
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
    const history = JSON.parse(localStorage.getItem("chatHistory")) || [];
    history.forEach(({ sender, text }) => appendMessage(sender, text, false));
  }

  loadChatHistory();

  const chatHistory = JSON.parse(localStorage.getItem("chatHistory")) || [];
  if (chatHistory.length === 0) {
    appendMessage("Coach Kiné", "Bonjour, je suis coach Kiné, assistant virtuel de Vincent. Je ne remplace pas une consultation  mais je peux répondre à pas mal de vos questions. On discute ?", false);
  }
});