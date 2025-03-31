const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handleChatWithFile = async (req, res) => {
  const userMessage = req.body.message;
const document = req.file;

if (!userMessage || !document) {
  return res.status(400).json({ reply: "Message et fichier requis." });
}

console.log("📥 Fichier reçu :", document.originalname, "| Type:", document.mimetype);


  const allowedMimeTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ];
  
  const ext = path.extname(document.originalname).toLowerCase();
  if (
    !allowedMimeTypes.includes(document.mimetype) &&
    ![".pdf", ".txt", ".doc", ".docx"].includes(ext)
  ) {
    fs.unlinkSync(document.path);
    return res.status(400).json({
      reply: "❌ Le format du fichier n’est pas pris en charge. Utilisez un PDF, DOC ou TXT."
    });
  }
  

  try {
    const uploadedFile = await openai.files.create({
      file: fs.createReadStream(document.path),
      purpose: "assistants"
    });

    const thread = await openai.beta.threads.create();

    await openai.beta.threads.messages.create(thread.id, {
      role: "user",
      content: userMessage,
      attachments: [{
        file_id: uploadedFile.id,
        tools: [{ type: "file_search" }]
      }]
      
    });
    

    const run = await openai.beta.threads.runs.create(thread.id, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID
    });

    let runStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    } while (runStatus.status !== "completed" && runStatus.status !== "failed");

    if (runStatus.status === "failed") {
      fs.unlinkSync(document.path);
      return res.status(500).json({ reply: "❌ Analyse échouée." });
    }

    const messages = await openai.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data.find((msg) => msg.role === "assistant");

    fs.unlinkSync(document.path);

    res.json({ reply: lastMessage?.content?.[0]?.text?.value || "Aucune réponse." });
  } catch (error) {
    console.error("Erreur GPT-4 avec fichier :", error);
    if (document?.path) fs.unlinkSync(document.path);
    res.status(500).json({ reply: "❌ Erreur serveur lors de l’analyse du document." });
  }
};
