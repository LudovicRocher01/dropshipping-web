const express = require("express");
const router = express.Router();
const { sendMessageToChatbot } = require("../controllers/chatbotController");
const rateLimit = require("express-rate-limit");

const chatbotLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  message: { error: "Trop de requêtes. Réessayez plus tard." },
});

router.post("/", chatbotLimiter, sendMessageToChatbot);

module.exports = router;