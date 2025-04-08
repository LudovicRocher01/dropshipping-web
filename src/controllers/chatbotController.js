const { OpenAI } = require("openai");
require("dotenv").config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.sendMessageToChatbot = async (req, res) => {
  const userMessage = req.body.message;

  try {
    if (!req.session.threadId) {
      const thread = await openai.beta.threads.create();
      req.session.threadId = thread.id;
    }

    const threadId = req.session.threadId;

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: userMessage,
    });

    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: process.env.OPENAI_ASSISTANT_ID,
    });

    let runStatus;
    do {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    } while (runStatus.status !== "completed" && runStatus.status !== "failed");

    if (runStatus.status === "failed") {
      return res.status(500).json({ reply: "❌ L'assistant n'a pas pu répondre." });
    }

    const messages = await openai.beta.threads.messages.list(threadId);
    const lastMessage = messages.data.find(msg => msg.role === "assistant");

    res.json({ reply: lastMessage?.content?.[0]?.text?.value || "Aucune réponse." });
  } catch (error) {
    console.error("Erreur ChatGPT :", error);
    res.status(500).json({ error: "Erreur serveur ChatGPT" });
  }
};