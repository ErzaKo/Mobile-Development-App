const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists or create it
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, 'event-photo-' + Date.now() + ext);
  }
});

const upload = multer({ storage });

module.exports = upload;
