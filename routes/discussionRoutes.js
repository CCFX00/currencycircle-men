const express = require('express');
const {
    getInDiscussionTrade,
    getAllInDiscussionTrades
} = require('../controllers/discussionController');
const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

router.route('/discussions').get(isAuthenticatedUser, getInDiscussionTrade);
router.route('/discussions/all').get(isAuthenticatedUser, getAllInDiscussionTrades);

module.exports = router;