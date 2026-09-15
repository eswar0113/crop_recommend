const express = require('express');
const router = express.Router();
const landController = require('../controllers/landController');
const { protect } = require('../middleware/authMiddleware');

// All land routes require authentication
router.use(protect);

router.get('/', landController.getLands);
router.get('/:id', landController.getLandById);
router.post('/', landController.createLand);
router.put('/:id', landController.updateLand);
router.delete('/:id', landController.deleteLand);

module.exports = router;
