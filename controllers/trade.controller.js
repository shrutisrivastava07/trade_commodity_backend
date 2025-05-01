const { toWebModel } = require('../mappers/trade.mapper');
const tradeService = require('../services/trade.service');

exports.create = async (req, res, next) => {
  try {
  const { commodity, quantity, action, type, tradeId } = req.body;
  const tradeData = { commodity, quantity, action, type, tradeId };
    const trade = await tradeService.placeTrade(tradeData);
        
  res.json({
          
        isSuccess: true,
        message: 'Trades added successfully',
        code: 'TRADE_ADDED_SUCCESS',
    })
  } catch (err) {
    console.error('Error adding trade in API:', err.message);
    next(err);
    // res.json({
          
    //   isSuccess: false,
    //   message: err,
    //    code: 'FAILED_WHILE_ADDING_TRADE',
    // });
};
}

// exports.updateStatus = async (req, res) => {
//   try {
//     const updated = await tradeService.changeTradeStatus(req.userId, req.params.tradeId, req.body.status);
//    // res.json(updated);
//     res.page(
//         mapper.toSearchModel(result.rows),
//         pageNo,
//         pageSize,
//         result.count
//    );
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };

exports.getAll = async (req, res,next) => {
  try {
    console.log("Fetching trades for user:", req.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = req.query.filter || {}; // Add filter from request query

    const result = await tradeService.fetchTrades(page, limit, filter);


    return res.json({
      totalRecords: result.count || 1,
      totalPage: Math.ceil(result.count / limit),
      pageNo: page,
      items:  toWebModel(result.rows),
      isSuccess: true,
      message: 'Trades fetched successfully',
      code: 'TRADE_FETCH_SUCCESS',
    });
  } catch (err) {
    console.error('Error fetching trades:', err);
    next(err)
    // res.json({
          
    //   isSuccess: false,
    //   message: err.message,
    //    code: 'FAILED_WHILE_FETCHING_TRADE',
    // });
  }
};
