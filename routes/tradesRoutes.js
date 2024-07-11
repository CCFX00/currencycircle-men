const { Router } = require('express')
const { isAuthenticatedUser } = require("../middleware/auth");

//controller methods
const { 
   getMatchedTrades,
   displayMatchedTrades
} = require('../controllers/tradesController')

const router = new Router()

//Trade Routes
router.route('/trade').get(isAuthenticatedUser, getMatchedTrades)
router.route('/trade').post(isAuthenticatedUser, displayMatchedTrades)

module.exports = router