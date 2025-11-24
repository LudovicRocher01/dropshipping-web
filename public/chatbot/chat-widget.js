document.addEventListener("DOMContentLoaded", () => {
  const chatButton = document.createElement("div");
  chatButton.id = "chat-toggle";
  chatButton.innerHTML = `
    <span class="chat-button-text">Coach AI</span>
    <img src="/images/coach_kine.jpg" alt="Coach AI" class="chat-avatar" />
    <span id="chat-notification" class="chat-notification-bubble">1</span>
  `;
  const footerContactDiv = document.querySelector('.footer-contact');
  
  if (footerContactDiv) {
      footerContactDiv.appendChild(chatButton);
      footerContactDiv.classList.add('mobile-buttons-container');
  } else {
      document.body.appendChild(chatButton);
  }

  const chatBox = document.createElement("div");
  chatBox.id = "chat-box";
  chatBox.innerHTML = `
  <div id="chat-header">
    <div class="chat-title">
      <img src="/images/coach_kine.jpg" alt="Coach AI" class="chat-avatar" />
      <span>Mon coach AI</span>
    </div>
    <div class="header-controls">
        <button id="chat-clear"><i class="fas fa-trash-alt"></i> Effacer</button>
        <span id="chat-close">&times;</span>
    </div>
  </div>
    <div id="chat-messages"></div>

    <div id="file-preview-container" style="display:none;">
        <span id="file-name-display"></span>
        <span id="remove-file" title="Supprimer le fichier">&times;</span>
    </div>

    <form id="chat-form-upload" enctype="multipart/form-data">
      <label for="chat-file-upload" id="file-btn" title="Joindre un fichier">
        <i class="fas fa-paperclip"></i>
      </label>
      
      <input type="file" id="chat-file-upload" multiple style="display: none;" />
      
      <input type="text" id="chat-input-upload" placeholder="Posez votre question..." autocomplete="off" required />
      
      <button type="submit">Envoyer <i class="fas fa-paper-plane" style="margin-left:5px;"></i></button>
    </form>
  `;
  document.body.appendChild(chatBox);

  const toggle = document.getElementById("chat-toggle");
  const box = document.getElementById("chat-box");
  const close = document.getElementById("chat-close");
  const messages = document.getElementById("chat-messages");
  const clear = document.getElementById("chat-clear");
  const notif = document.getElementById("chat-notification");

  const unifiedFile = document.getElementById("chat-file-upload");
  const filePreview = document.getElementById("file-preview-container");
  const fileNameDisplay = document.getElementById("file-name-display");
  const removeFileBtn = document.getElementById("remove-file");

  unifiedFile.addEventListener("change", () => {
    if (unifiedFile.files.length > 0) {
        filePreview.style.display = "flex";
        const names = Array.from(unifiedFile.files).map(f => f.name).join(", ");
        fileNameDisplay.textContent = names;
    } else {
        filePreview.style.display = "none";
    }
  });

  removeFileBtn.addEventListener("click", () => {
    unifiedFile.value = "";
    filePreview.style.display = "none";
  });

  clear.addEventListener("click", () => {
    localStorage.removeItem("chatHistory");
    messages.innerHTML = "";
    appendMessage("Coach AI", "Bonjour, je suis coach AI, assistant virtuel de Vincent. Je ne remplace pas une consultation mais je peux répondre à pas mal de vos questions. On discute ?", false);
  });
  
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

  unifiedForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const messageText = unifiedInput.value.trim();
    const files = Array.from(unifiedFile.files);
  
    if (!messageText && files.length === 0) return;
  
    const fileLabel = files.length > 0 ? ` (📎 ${files.map(f => f.name).join(", ")})` : "";
    appendMessage("Vous", messageText + fileLabel);
    
    unifiedInput.value = "";
    unifiedFile.value = "";
    filePreview.style.display = "none"; // Cacher la preview après envoi

    appendMessage("Coach AI", "⏳ Traitement en cours...", false);
  
    try {
      let data;
  
      if (files.length > 0) {
        const formData = new FormData();
        formData.append("message", messageText);
  
        files.forEach(file => {
          formData.append("documents", file);
        });
  
        const allAreImages = files.every(file => file.type.startsWith("image/"));
        const route = allAreImages ? "/api/chatbotImage" : "/api/chatbotfile";
  
        const res = await fetch(route, {
          method: "POST",
          body: formData
        });
  
        data = await res.json();
      } 
      else {
        const res = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText })
        });
  
        data = await res.json();
      }
  
      messages.lastChild.remove();
      appendMessage("Coach AI", data.reply || "Réponse vide.");
    } catch (err) {
      messages.lastChild.remove();
      console.error(err);
      appendMessage("Coach AI", "❌ Une erreur est survenue lors du traitement de votre demande.");
    }
  });  

function appendMessage(sender, text, save = true) {
  const msg = document.createElement("div");
  msg.className = `chat-message ${sender === "Vous" ? "user" : "bot"}`;
  msg.innerHTML = `
    <strong>${sender} :</strong>
    <div class="chat-text">${text}</div>
  `;
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
    appendMessage("Coach AI", "Bonjour, je suis coach AI, assistant virtuel de Vincent. Je ne remplace pas une consultation mais je peux répondre à pas mal de vos questions. On discute ?", false);
  }
});