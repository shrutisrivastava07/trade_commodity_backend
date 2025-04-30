const tradeService = require('../services/trade.service');

exports.addTrade = async (req, res) => {
  try {
    const trade = await tradeService.placeTrade(req.userId, req.body);
    res.status(201).json(trade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const updated = await tradeService.changeTradeStatus(req.userId, req.params.tradeId, req.body.status);
   // res.json(updated);
    res.page(
        mapper.toSearchModel(result.rows),
        pageNo,
        pageSize,
        result.count
   );
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

exports.getAllTrades = async (req, res) => {
  try {
    console.log("Fetching trades for user:", req.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const items = await tradeService.fetchTrades( page, limit);
//     res.page(
//         data,
//         data.totalPages,
//         limit,
//         data.totalItems
//    );
    
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
    //res.failure(err);
  }
};
