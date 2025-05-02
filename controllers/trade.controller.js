const { toWebModel } = require('../mappers/trade.mapper');
const tradeService = require('../services/trade.service');
// services/trade.service.js
const {
  createTrade,
  fetchExistingTrades,

} = require('../dal/trade.dal');
const commodityService = require('../services/commodity.service');
const tradeUtils = require('../utils/trade.utils');

const db = require('../models');
const { lockCommodityForUpdate, lockTradeForUpdate } = require('../utils/lock.utils');


exports.create = async (req, res, next) => {
  try {
  const { commodity, quantity, action, type, tradeId } = req.body;
  const tradeData = { commodity, quantity, action, type, tradeId };
  console.log('Trade Data: before creating' , tradeData);
    const trade = await tradeService.placeTrade(tradeData,{
      db,
      tradeUtils,
      fetchExistingTrades,
      lockCommodityForUpdate,
      lockTradeForUpdate,
      createTrade,
      commodityService,
    }

    );
        
  res.json({
          
        isSuccess: true,
        message: 'Trades added successfully',
        code: 'TRADE_ADDED_SUCCESS',
    })
  } catch (err) {
    console.error('Error adding trade in API:', err.message);
    next(err);

};
}



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

  }
};
