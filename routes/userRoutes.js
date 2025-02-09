const { Router } = require('express')
const multer = require('multer');

//controller methods
const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    getAllUserskeyword,
    fileUpload,
    loginUser,
    logoutUser,
    verifyUserOTP,
    resendOTPCode,
    forgotPassword,
    resetPassword,
    getSingleUserByEmail,
    getSingleUserById
} = require('../controllers/userControllers')
const { isAuthenticatedUser, isVerifiedUser } = require("../middleware/auth");

const router = new Router()

router.route('/users').get(isAuthenticatedUser, getAllUsers)
router.route('/user/key').get(isAuthenticatedUser, getAllUserskeyword)
router.route('/user').get(isAuthenticatedUser, getSingleUserByEmail)
router.route('/user/:id')
.get(isAuthenticatedUser, getSingleUserById)
.put(isAuthenticatedUser, updateUser)
.delete(isAuthenticatedUser, deleteUser)

// Upload user files
router.route('/upload').post(multer().any(), fileUpload)

// auth routes
router.route('/signup').post(createUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)
router.route('/verify').post(verifyUserOTP)
router.route('/resendOTP').post(resendOTPCode)
router.route('/password/forgot').post(forgotPassword)
router.route('/password/reset').put(resetPassword)

module.exports = router