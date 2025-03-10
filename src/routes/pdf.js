const express = require("express");
const router = express.Router();
const pdfController = require("../controllers/pdfController");

router.get("/:code", pdfController.verifierCode);
router.post("/generate-code", pdfController.genererCodeAcces);

module.exports = router;
