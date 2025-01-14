const { Router } = require('express')
const { isAuthenticatedUser } = require("../middleware/auth");

//controller methods
const { 
   getMatchedTrades,
   displayMatchedTrades,
   displayAllMatchedTrades
} = require('../controllers/tradesController')

const router = new Router()

//Trade Routes
router.route('/trade').get(isAuthenticatedUser, getMatchedTrades)
router.route('/trade/all').get(isAuthenticatedUser, displayAllMatchedTrades)
router.route('/trade').post(isAuthenticatedUser, displayMatchedTrades)

module.exports = router