const { Router } = require('express')

//controller methods
const { 
    displayRate
} = require('../controllers/ratesController')

const router = new Router()

//Offer Routes
router.route('/latest').post(displayRate)

module.exports = router