const express = require('express');
const router = express.Router();
const historyController = require('../controllers/historyController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/history  (protected)
router.get('/history', protect, historyController.getHistory);

// DELETE /api/history  (protected)
router.delete('/history', protect, historyController.deleteHistory);

module.exports = router;
