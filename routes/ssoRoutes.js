const { Router } = require('express')
const router = new Router()
const { isLoggedIn } = require('../middleware/auth')
const { 
    oAuth,
    oAuthRedirect,
    oAuthRedirectCallback,
    loginSuccess,
    notFound 
} = require('../controllers/ssoController')


router.route("/auth/google").get(oAuth);
router.route("/auth/google/callback").get(oAuthRedirect, oAuthRedirectCallback);
router.route('/oauth').get(isLoggedIn, loginSuccess)
router.route('/oauth/401').get(notFound) 


module.exports = router;