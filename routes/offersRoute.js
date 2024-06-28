const { Router } = require('express')
const { isAuthenticatedUser } = require("../middleware/auth");

//controller methods
const { 
   getRate,
   createOffer,
   getOfferDetails
} = require('../controllers/offersController')

const router = new Router()

//Offer Routes
router.route('/latest').get(getRate)
router.route('/offer/new').post(isAuthenticatedUser, createOffer)
router.route('/offer/details').get(isAuthenticatedUser, getOfferDetails)

module.exports = router