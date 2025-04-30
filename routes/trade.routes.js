const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', tradeController.addTrade);
router.put('/:tradeId/status',  tradeController.updateStatus);
router.get('/', tradeController.getAllTrades);


module.exports = router;
