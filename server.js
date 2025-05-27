const express = require("express");
const app = express();

const authRoutes = require("./routes/authRoutes");
const predictRoutes = require("./routes/predictRoutes");

const authMiddleware = require("./middlewares/authMiddleware");
const cors = require("cors");

const PORT = process.env.PORT || 3001;
const tf = require("@tensorflow/tfjs");

app.use("/model", express.static("model"));
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api", authMiddleware, predictRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
