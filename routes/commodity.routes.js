const express = require('express');
const router = express.Router();
const commodityController = require('../controllers/commodity.controller');


router.get('/', commodityController.getAll);


module.exports = router;
