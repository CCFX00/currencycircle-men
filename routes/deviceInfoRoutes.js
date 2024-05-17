const express = require('express');
const deviceInfoController = require('../controllers/deviceInfoController');

const router = express.Router();

router.get('/device-info', deviceInfoController.getDeviceInfo);

module.exports = router;
