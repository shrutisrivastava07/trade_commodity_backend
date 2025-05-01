// services/trade.service.js
const {
  createTrade,
  findTradeById,
  updateTradeStatus,
  getAllTrades,
  fetchExistingTrades,
  generateNewTradeId,
  fetchTradeByIdAndAction,
} = require('../dal/trade.dal');
const commodityService = require('./commodity.service');
const tradeUtils = require('../utils/trade.utils');

exports.placeTrade = async (tradeData) => {
  try {
    let updatedQuantity = 0;

    if (tradeData.action === 'INSERT') {
      await tradeUtils.handleInsertAction(tradeData);
      updatedQuantity = await tradeUtils.updateCommodityQuantityOnInsert(tradeData);
    } else {
      updatedQuantity = await tradeUtils.handleUpdateOrCancelAction(tradeData);
    }

    const commodityData = tradeUtils.prepareCommodityData(tradeData.commodity, updatedQuantity);
    console.log('Commodity Data before update', commodityData);
    await commodityService.update(commodityData.id, commodityData);

    console.log('Trade Data before insert', tradeData);
    const finalTradeData = tradeUtils.prepareFinalTradeData(tradeData);
    return createTrade(finalTradeData);
  } catch (error) {
    console.error('Error placing trade:', error);
    throw error;
  }
};

exports.changeTradeStatus = async (userId, tradeId, status) => {
  const trade = await findTradeById(tradeId, userId);
  if (!trade) throw new Error('trade not found');
  return updateTradeStatus(trade, status);
};

exports.fetchTrades = async (page, limit, filter = {}) => {
  const offset = (page - 1) * limit;
  let result = await getAllTrades(offset, limit, filter);
  let trades = result.rows || [];

  const tradesWithButtons = tradeUtils.addActionButtons(trades);
  result.rows = tradesWithButtons;
  return result;
};
