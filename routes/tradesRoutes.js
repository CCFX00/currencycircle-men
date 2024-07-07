const { Router } = require('express')
const { isAuthenticatedUser } = require("../middleware/auth");

//controller methods
const { 
   getMatchedTrades
} = require('../controllers/tradesController')

const router = new Router()

//Trade Routes
router.route('/trade').get(isAuthenticatedUser, getMatchedTrades)

module.exports = router