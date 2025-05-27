const multer = require("multer");

// Simpan di memori (agar bisa langsung akses buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;
