const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.sendMessageToChatbot = async (req, res) => {
  const userMessage = req.body.message;
  const systemPrompt = process.env.CHATBOT_PROMPT;

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    });

    const reply = chatCompletion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error("Erreur ChatGPT :", error);
    res.status(500).json({ error: "Erreur serveur ChatGPT" });
  }
};
