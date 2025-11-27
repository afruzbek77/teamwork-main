const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload papkasini avtomatik yaratish
const dir = path.join(__dirname, "../../uploads/avatars");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, dir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  }
});

// faqat rasm qabul qiladi
const fileFilter = (req, file, cb) => {
  const types = ["image/png", "image/jpg", "image/jpeg"];
  if (types.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only jpg, jpeg, png allowed!"));
};

module.exports = multer({ storage, fileFilter });