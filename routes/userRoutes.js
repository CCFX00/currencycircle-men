const { Router } = require('express')
const multer = require('multer');

//controller methods
const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    getSingleUser, 
    getAllUserskeyword,
    fileUpload,
    loginUser,
    logoutUser
} = require('../controllers/userControllers')
const { isAuthenticatedUser } = require("../middleware/auth");

const router = new Router()

router.route('/users').get(isAuthenticatedUser, getAllUsers)
router.route('/user').get(isAuthenticatedUser, getAllUserskeyword)
router.route('/user/:id')
.get(isAuthenticatedUser, getSingleUser)

// Upload user files
router.route('/upload').post(multer().any(), fileUpload)

// admin routes
.put(isAuthenticatedUser, updateUser)
.delete(isAuthenticatedUser, deleteUser)

// auth routes
router.route('/signup').post(createUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)

module.exports = router