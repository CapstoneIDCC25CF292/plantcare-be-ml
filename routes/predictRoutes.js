const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const {
  predictImage,
  getPredictionDetail,
  getAllHistory,
} = require("../controllers/predictController");

router.post("/predict", upload.single("image"), predictImage);
router.get("/predict/:id", getPredictionDetail);
router.get("/predict", getAllHistory);

module.exports = router;
