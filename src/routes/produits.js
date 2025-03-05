const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { verifierAdmin } = require('../routes/auth');
const { getProduits, addProduit, updateProduit, deleteProduit } = require('../controllers/produitController');
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: { error: "Trop de requêtes, veuillez réessayer plus tard." }
});

const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Format de fichier non autorisé. Seuls JPG, PNG, GIF sont acceptés."), false);
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 }
});

router.get('/', limiter, getProduits);
router.post('/', verifierAdmin, limiter, upload.single("image"), addProduit);
router.put('/:id', verifierAdmin, limiter, upload.single("image"), updateProduit);
router.delete('/:id', verifierAdmin, limiter, deleteProduit);

router.use("/uploads", express.static("uploads"));

module.exports = router;