const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handleChatWithFile = async (req, res) => {
  const userMessage = req.body.message;
  const documents = req.files;

  if (!userMessage || !documents || documents.length === 0) {
    return res.status(400).json({ reply: "Message et fichier requis." });
  }

  try {
    const uploadedFiles = [];

    for (const doc of documents) {
      const ext = path.extname(doc.originalname).toLowerCase();
      const allowedMimeTypes = [
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];

      if (
        !allowedMimeTypes.includes(doc.mimetype) &&
        ![".pdf", ".txt", ".doc", ".docx"].includes(ext)
      ) {
        fs.unlinkSync(doc.path);
        return res.status(400).json({
          reply: "❌ Le format du fichier n’est pas pris en charge. Utilisez un PDF, DOC ou TXT."
        });
      }

      const uploaded = await openai.files.create({
        file: fs.createReadStream(doc.path),
        purpose: "assistants"
      });

      uploadedFiles.push(uploaded.id);
    }

    if (!req.session.threadId) {
      const thread = await openai.beta.threads.create();
      req.session.threadId = thread.id;
    }

    const threadId = req.session.threadId;

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
      attachments: uploadedFiles.map(file_id => ({
        file_id,
        tools: [{ type: "file_search" }]
      }))
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID
    });

    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (runStatus.status !== "completed" && runStatus.status !== "failed");

    documents.forEach(doc => fs.unlinkSync(doc.path));

    if (runStatus.status === "failed") {
      return res.status(500).json({ reply: "❌ Échec du traitement." });
    }

    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data.find(msg => msg.role === "assistant");

    res.json({ reply: lastMessage?.content?.[0]?.text?.value || "Aucune réponse." });

  } catch (error) {
    console.error("❌ Erreur GPT-4 avec fichier :", error);
    documents.forEach(doc => fs.existsSync(doc.path) && fs.unlinkSync(doc.path));
    res.status(500).json({ reply: "❌ Erreur serveur lors de l’analyse du document." });
  }
};