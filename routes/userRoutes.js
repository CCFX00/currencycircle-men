const { Router } = require('express')

//controller methods
const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    getSingleUser, 
    getAllUserskeyword,
    loginUser,
    logoutUser
} = require('../controllers/userControllers')
const { isAuthenticatedUser } = require("../middleware/auth");

const router = new Router()

router.route('/users').get(isAuthenticatedUser, getAllUsers)
router.route('/user').get(isAuthenticatedUser, getAllUserskeyword)
router.route('/user/:id')
.get(isAuthenticatedUser, getSingleUser)
// admin routes
.put(isAuthenticatedUser, updateUser)
.delete(isAuthenticatedUser, deleteUser)

// auth routes
router.route('/signup').post(createUser)
router.route('/login').post(loginUser)
router.route('/logout').get(logoutUser)

module.exports = router