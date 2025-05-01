const express = require('express');
const router = express.Router();
const tradeController = require('../controllers/trade.controller');
const auth = require('../middlewares/auth.middleware');

router.post('/', tradeController.create);
// router.put('/:tradeId/status',  tradeController.updateStatus);
router.get('/', tradeController.getAll);


module.exports = router;
