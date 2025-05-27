const db = require("../config/db");

exports.savePrediction = async (userId, predictionData, imageBuffer) => {
  const { prediction, maxIndex, class_name, confidence, next_info } =
    predictionData;

  // Mengonversi buffer gambar menjadi string base64
  const imageBase64 = imageBuffer.toString("base64");

  const query = `
    INSERT INTO historypredict (user_id, prediction, max_index, class_name, confidence, next_info, image)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING id, user_id, image; 
  `;

  const values = [
    userId,
    JSON.stringify(prediction),
    maxIndex,
    class_name,
    confidence,
    JSON.stringify(next_info),
    imageBase64, // Menggunakan base64 untuk gambar
  ];

  try {
    const res = await db.query(query, values);
    return res.rows[0]; // Mengembalikan data hasil penyimpanan (id, user_id, image)
  } catch (err) {
    console.error("Error saving prediction:", err);
    throw err;
  }
};

exports.getPredictionDetailById = async (historyId) => {
  const query = `
    SELECT 
      id,
      user_id,
      prediction,
      max_index,
      class_name,
      confidence,
      next_info,
      image,
      prediction_time
    FROM historypredict
    WHERE id = $1
  `;

  try {
    const res = await db.query(query, [historyId]);

    if (res.rows.length === 0) {
      throw new Error(`No prediction history found with id ${historyId}`);
    }

    // Parsing kembali field JSON agar mudah dipakai
    const row = res.rows[0];
    return {
      ...row,
      prediction: row.prediction,
      next_info: row.next_info,
    };
  } catch (err) {
    console.error("Error getting prediction detail:", err);
    throw err;
  }
};

exports.getAllHistoryByUser = async (userId) => {
  const query = `
    SELECT 
      id,
      class_name AS disease_name,
      next_info ->> 'meaning' AS description,
      image,
      confidence,
      prediction_time
    FROM historypredict
    WHERE user_id = $1
    ORDER BY prediction_time DESC

  `;

  try {
    const { rows } = await db.query(query, [userId]);
    return rows.map(
      ({
        id,
        disease_name,
        description,
        confidence,
        prediction_time,
        image,
      }) => ({
        id,
        disease_name,
        description,
        confidence: parseFloat(confidence),
        date_predict: prediction_time,
        image,
      })
    );
  } catch (err) {
    console.error("Error retrieving prediction history:", err);
    throw new Error("Failed to retrieve prediction history.");
  }
};
