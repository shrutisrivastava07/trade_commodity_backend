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
//const db = require('../db'); // Assuming you have a database module to handle transactions
const db = require('../models');
exports.placeTrade = async (tradeData) => {
  try {
    let updatedQuantity = 0;

  //   if (tradeData.action === 'INSERT') {
  //     await tradeUtils.updateTradeVersionIdOrGenerateNew(tradeData, tradeData.action);

  //    // updatedQuantity = await tradeUtils.updateCommodityQuantityOnInsert(tradeData);
  //  //  await tradeUtils.updateCommodityQuantity(tradeData, tradeData.action);
  //   } else {
    //const latestTrade = existingTrades[0];
    // updatedQuantity = await tradeUtils.handleUpdateOrCancelAction(tradeData);
    // }
    let lastTrade = null;
    const action = tradeData.action;
    if (action === 'UPDATE' || action === 'CANCEL') {
  
        tradeUtils.validateTradeId(tradeData);
         const existingTrades = await fetchExistingTrades(tradeData.tradeId);
         tradeUtils.validationBeforeUpdateCancel(existingTrades);

         lastTrade  = existingTrades[0] || null;
     }
      await tradeUtils.updateTradeVersionIdOrGenerateNew(tradeData,  tradeData.action, lastTrade);
      updatedQuantity = await tradeUtils.updateCommodityQuantity(tradeData, tradeData.action);

      
      const commodityData = tradeUtils.prepareCommodityData(tradeData.commodity, updatedQuantity);
      const finalTradeData = tradeUtils.prepareFinalTradeData(tradeData);
      console.log('Commodity Data before update', commodityData);
      console.log('Trade Data before insert', tradeData);

    if (db.sequelize && db.sequelize.transaction) {
      await db.sequelize.transaction(async (transaction) => {
        await commodityService.update(commodityData.id, commodityData, { transaction });
        await createTrade(finalTradeData, { transaction });
      });
    } else {
      throw new Error('Database transaction method is not available.');
    }
  } catch (error) {
    console.log('Error placing trade:', error.message);
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
