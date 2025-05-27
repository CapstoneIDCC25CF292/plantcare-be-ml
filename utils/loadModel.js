// utils/loadModel.js
const tf = require("@tensorflow/tfjs");

let model = null;

async function getModel() {
  if (!model) {
    model = await tf.loadGraphModel(
      "https://plantcare.up.railway.app/model/model.json"
      // "http://localhost:3001/model/model.json"
    );
    console.log("✅ Model loaded");
  }
  return model;
}

module.exports = getModel;
