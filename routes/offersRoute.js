const { Router } = require('express')
const { isAuthenticatedUser } = require("../middleware/auth");

//controller methods
const { 
   createOffer,
   displayOfferDetails
} = require('../controllers/offersController')

const router = new Router()

//Offer Routes
router.route('/offer/new').post(isAuthenticatedUser, createOffer)
router.route('/offer/details').get(isAuthenticatedUser, displayOfferDetails)

module.exports = router