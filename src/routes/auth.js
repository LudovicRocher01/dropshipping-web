const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { login, verifyToken, verifierAdmin } = require("../controllers/authController");

// 🔹 Protection brute-force
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: "Trop de tentatives, veuillez réessayer plus tard." },
    headers: true,
});

// Routes
router.post("/login", loginLimiter, login);
router.post("/verify", verifyToken);

module.exports = { router, verifierAdmin };
