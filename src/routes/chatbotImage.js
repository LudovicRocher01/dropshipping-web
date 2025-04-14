const express = require('express');
const router = express.Router();
const multer = require('multer');
const { handleChatWithMultipleFiles } = require('../controllers/chatbotImageController');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage });

router.post('/', upload.array("documents"), handleChatWithMultipleFiles);

module.exports = router;