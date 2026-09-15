const axios = require('axios');
const db = require('../db');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

exports.predictCrop = async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall, land_id } = req.body;
    const farmerId = req.user ? req.user.id : null;

    // 1. Input Validation
    if (!land_id) {
      return res.status(400).json({
        success: false,
        error: 'land_id is required to perform a prediction.'
      });
    }

    const landIdNum = parseInt(land_id, 10);
    if (isNaN(landIdNum)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid land_id specified.'
      });
    }

    // Verify land ownership
    const checkLandQuery = 'SELECT id FROM lands WHERE id = $1 AND farmer_id = $2;';
    const checkResult = await db.query(checkLandQuery, [landIdNum, farmerId]);

    if (checkResult) {
      if (!checkResult.rows || checkResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: 'Specified land record not found or access denied.'
        });
      }
    } else {
      // Memory fallback check
      const landExists = db.inMemoryLands.some((l) => l.id === landIdNum && l.farmer_id === farmerId);
      if (!landExists) {
        return res.status(403).json({
          success: false,
          error: 'Specified land record not found or access denied.'
        });
      }
    }

    if (
      N === undefined || P === undefined || K === undefined ||
      temperature === undefined || humidity === undefined ||
      ph === undefined || rainfall === undefined
    ) {
      return res.status(400).json({
        success: false,
        error: 'All 7 features (N, P, K, temperature, humidity, ph, rainfall) are required.'
      });
    }

    const nNum = parseFloat(N);
    const pNum = parseFloat(P);
    const kNum = parseFloat(K);
    const tempNum = parseFloat(temperature);
    const humNum = parseFloat(humidity);
    const phNum = parseFloat(ph);
    const rainNum = parseFloat(rainfall);

    if (
      isNaN(nNum) || isNaN(pNum) || isNaN(kNum) ||
      isNaN(tempNum) || isNaN(humNum) || isNaN(phNum) || isNaN(rainNum)
    ) {
      return res.status(400).json({
        success: false,
        error: 'All inputs must be valid numbers.'
      });
    }

    if (nNum < 0 || pNum < 0 || kNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Soil nutrients (N, P, K) cannot be negative.'
      });
    }

    if (phNum < 0 || phNum > 14) {
      return res.status(400).json({
        success: false,
        error: 'Soil pH must be between 0 and 14.'
      });
    }

    if (humNum < 0 || humNum > 100) {
      return res.status(400).json({
        success: false,
        error: 'Humidity percentage must be between 0 and 100.'
      });
    }

    if (rainNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Rainfall cannot be negative.'
      });
    }

    // 2. Call Python ML Service
    let mlResponse;
    try {
      mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
        N: nNum,
        P: pNum,
        K: kNum,
        temperature: tempNum,
        humidity: humNum,
        ph: phNum,
        rainfall: rainNum
      }, { timeout: 5000 });
    } catch (mlErr) {
      console.error('[ML Service Connection Error]', mlErr.message);
      return res.status(503).json({
        success: false,
        error: 'Machine Learning service is currently unavailable. Please make sure the Python ML service is running on port 8000.'
      });
    }

    const predictedCrop = mlResponse.data.predicted_crop;

    if (!predictedCrop) {
      return res.status(500).json({
        success: false,
        error: 'ML service did not return a valid crop prediction.'
      });
    }

    // 3. Store prediction result in PostgreSQL (or fallback storage)
    const insertQuery = `
      INSERT INTO prediction_history (land_id, N, P, K, temperature, humidity, ph, rainfall, predicted_crop)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const queryParams = [landIdNum, nNum, pNum, kNum, tempNum, humNum, phNum, rainNum, predictedCrop];
    let savedRecord = null;

    const dbResult = await db.query(insertQuery, queryParams);

    if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
      savedRecord = dbResult.rows[0];
    } else {
      // Memory fallback insertion
      const fallbackRecord = {
        id: db.memoryIdCounter.get(),
        land_id: landIdNum,
        N: nNum,
        P: pNum,
        K: kNum,
        temperature: tempNum,
        humidity: humNum,
        ph: phNum,
        rainfall: rainNum,
        predicted_crop: predictedCrop,
        created_at: new Date().toISOString()
      };
      db.memoryIdCounter.inc();
      db.inMemoryHistory.unshift(fallbackRecord);
      savedRecord = fallbackRecord;
    }

    // 4. Send Response to React Frontend
    return res.status(200).json({
      success: true,
      predicted_crop: predictedCrop,
      record: savedRecord
    });

  } catch (error) {
    console.error('[Predict Endpoint Error]', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while processing the crop prediction.'
    });
  }
};
