const express = require('express');
const router = express.Router();
const { autofillAddress } = require('../controllers/addressController');

router.get('/', autofillAddress);

module.exports = router;
