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
    fileUpload
} = require('../controllers/userControllers')

const router = new Router()

router.route('/users').get(getAllUsers)
router.route('/user').get(getAllUserskeyword)
router.route('/user/:id')
.get(getSingleUser)

// Upload user files
router.route('/upload').post(multer().any(), fileUpload)

// admin routes
.put(updateUser)
.delete(deleteUser)

// auth routes
router.route('/signup').post(createUser)

module.exports = router