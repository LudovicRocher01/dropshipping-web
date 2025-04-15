const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handleChatWithMultipleFiles = async (req, res) => {
  const userMessage = req.body.message;
  const documents = req.files;

  if (!userMessage || !documents || documents.length === 0) {
    return res.status(400).json({ reply: "Message et fichiers requis." });
  }

  try {
    const uploadedFiles = [];
    for (const doc of documents) {
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
            tools: [{ type: "code_interpreter" }]
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

    if (runStatus.status === "failed") {
      return res.status(500).json({ reply: "❌ Échec du traitement." });
    }

    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data.find(msg => msg.role === "assistant");

    documents.forEach(doc => fs.unlinkSync(doc.path));

    res.json({ reply: lastMessage?.content?.[0]?.text?.value || "Aucune réponse." });
  } catch (err) {
    console.error("❌ Erreur multiple files:", err);
    res.status(500).json({ reply: "❌ Erreur lors de l'analyse des fichiers." });
  }
};
