const { Router } = require('express')

//controller methods
const { 
    getAllUsers, 
    createUser, 
    updateUser, 
    deleteUser,
    getSingleUser, 
    getAllUserskeyword
} = require('../controllers/userControllers')

const router = new Router()

router.route('/users').get(getAllUsers)
router.route('/user').get(getAllUserskeyword)
router.route('/user/:id')
.get(getSingleUser)
// admin routes
.put(updateUser)
.delete(deleteUser)

// auth routes
router.route('/signup').post(createUser)

module.exports = router