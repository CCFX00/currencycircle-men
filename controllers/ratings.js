const Rating = require('../models/ratingModel');

// Add a new rating
exports.addRating = async (req, res) => {
  const { userId, tradeId, rating, comment } = req.body;
  const newRating = new Rating({ userId, tradeId, rating, comment });
  try {
    const savedRating = await newRating.save();
    res.status(201).send(savedRating);
  } catch (err) {
    res.status(400).send(err);
  }
};

// Get ratings for a trade
exports.getRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ tradeId: req.params.tradeId });
    res.send(ratings);
  } catch (err) {
    res.status(400).send(err);
  }
};
