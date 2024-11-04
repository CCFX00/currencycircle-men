const { Router } = require('express')
const { isAuthenticatedUser } = require("../middleware/auth");

//controller methods
const { 
   getMatchedTrades,
   displayMatchedTrades,
   displayAllMatchedTrades,
   getAllCompletedTrades,
   getAllCancelledTrades
} = require('../controllers/tradesController')

const router = new Router()

//Trade Routes
router.route('/trade').get(isAuthenticatedUser, getMatchedTrades)
router.route('/trade').post(isAuthenticatedUser, displayMatchedTrades)
router.route('/trade/all').get(isAuthenticatedUser, displayAllMatchedTrades)
router.route('/trades/completed').post(isAuthenticatedUser, getAllCompletedTrades)
router.route('/trades/cancelled').post(isAuthenticatedUser, getAllCancelledTrades)

module.exports = router