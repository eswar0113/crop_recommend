const express = require('express');
const router = express.Router();
const predictionController = require('../controllers/predictionController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/predict  (protected)
router.post('/predict', protect, predictionController.predictCrop);

module.exports = router;
