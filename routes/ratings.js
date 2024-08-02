const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratings');

// Add a new rating
router.post('/ratings', ratingController.addRating);

// Get ratings for a trade
router.get('/ratings:tradeId', ratingController.getRatings);

module.exports = router;
