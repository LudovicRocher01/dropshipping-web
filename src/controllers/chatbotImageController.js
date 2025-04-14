const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.handleChatWithImage = async (req, res) => {
  const userMessage = req.body.message;
  const image = req.file;

  if (!userMessage || !image) {
    return res.status(400).json({ reply: "Message et image requis." });
  }

  try {
    const base64Image = fs.readFileSync(image.path, { encoding: 'base64' });

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: userMessage },
            {
              type: "image_url",
              image_url: {
                url: `data:${image.mimetype};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    fs.unlinkSync(image.path);

    const reply = completion.choices[0].message.content;
    res.json({ reply });

  } catch (error) {
    console.error("Erreur GPT Vision:", error);
    if (image?.path) fs.unlinkSync(image.path);
    res.status(500).json({ reply: "❌ Erreur lors de l’analyse de l’image." });
  }
};