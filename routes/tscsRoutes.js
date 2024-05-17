const express = require('express');
const tscsController = require('../controllers/tscsController');

const router = express.Router();

// Route to handle user registration
router.post('/reg/tcs', tscsController.tscsReg);

// Route to fetch terms and conditions
router.get('/get/tcs', tscsController.tscsGet);

// Route to update Users' terms and conditions status
router.put('/update/tcs/users', tscsController.falsyAllUserTsCsStatus);

// Route to accept terms and conditions
router.put('/accept/tcs', tscsController.truthyUserTsCsStatus);

module.exports = router;
