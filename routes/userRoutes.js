const { Router } = require('express')
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
router.route('/user/new').post(createUser)
router.route('/user/:id').put(updateUser).delete(deleteUser).get(getSingleUser)

module.exports = router