const express = require('express');
const tscsController = require('../controllers/tscsController');

const router = express.Router();

// Route to handle user registration
router.post('/reg/tcs', tscsController.tscsReg);

// Route to fetch terms and conditions
router.get('/get/tcs', tscsController.tscsGet);

module.exports = router;
