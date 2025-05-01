const {
  createTrade,
  findTradeById,
  updateTradeStatus,
  getAllTrades,
  fetchExistingTrades,
} = require('../dal/trade.dal');
const commodityService = require('./commodity.service');
const tradeUtils = require('../utils/trade.utils');
const db = require('../models');
const { handleTradePlacement } = require('./trade.handler');

exports.placeTrade = async (tradeData) => {
  try {
    const { commodityData, finalTradeData } = await handleTradePlacement({
      tradeData,
      fetchExistingTrades,
      updateTradeVersionIdOrGenerateNew: tradeUtils.updateTradeVersionIdOrGenerateNew,
      updateCommodityQuantity: tradeUtils.updateCommodityQuantity,
      prepareCommodityData: tradeUtils.prepareCommodityData,
      prepareFinalTradeData: tradeUtils.prepareFinalTradeData,
      validateTradeId: tradeUtils.validateTradeId,
      validationBeforeUpdateCancel: tradeUtils.validationBeforeUpdateCancel,
    });

    if (db.sequelize?.transaction) {
      await db.sequelize.transaction(async (transaction) => {
        await commodityService.update(commodityData.id, commodityData, { transaction });
        await createTrade(finalTradeData, { transaction });
      });
    } else {
      throw new Error('Database transaction method is not available.');
    }
  } catch (error) {
    console.error('Error placing trade:', error.message);
    throw error;
  }
};

exports.changeTradeStatus = async (userId, tradeId, status) => {
  const trade = await findTradeById(tradeId, userId);
  if (!trade) throw new Error('Trade not found');
  return updateTradeStatus(trade, status);
};

exports.fetchTrades = async (page, limit, filter = {}) => {
  const offset = (page - 1) * limit;
  const result = await getAllTrades(offset, limit, filter);
  result.rows = tradeUtils.addActionButtons(result.rows || []);
  return result;
};
