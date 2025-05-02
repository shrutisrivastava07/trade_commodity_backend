
const {
  
  findTradeById,
  updateTradeStatus,
  getAllTrades,

  generateNewTradeId,
  fetchTradeByIdAndAction,

} = require('../dal/trade.dal');

 const tradeUtils = require('../utils/trade.utils');

const validateTransaction = require('../helpers/validateTransaction');
const executeTradeTransaction = require('../helpers/executeTradeTransaction');
const handleUpdateOrCancel = require('../helpers/handleUpdateOrCancel');


exports.placeTrade = async (tradeData, {
  db,
  tradeUtils,
  fetchExistingTrades,
  lockCommodityForUpdate,
  lockTradeForUpdate,
  createTrade,
  commodityService,
}) => {
  try {
    const { action, tradeId, commodity } = tradeData;
    console.log('Trade Data inside place rtade:', tradeData);

    const lastTrade = await handleUpdateOrCancel(action, tradeId, tradeData, fetchExistingTrades, tradeUtils);
    console.log('Last Trade:', lastTrade);
    await tradeUtils.updateTradeVersionIdOrGenerateNew(tradeData, action, lastTrade, { generateNewTradeId });
    console.log('Trade Data after version update:', tradeData);
    const updatedQuantity = await tradeUtils.updateCommodityQuantity(tradeData, action, { commodityService, fetchTradeByIdAndAction });
    console.log('Updated Quantity:', updatedQuantity);
    const commodityData = tradeUtils.prepareCommodityData(commodity, updatedQuantity);
    console.log('Commodity Data:', commodityData);
    const finalTradeData = tradeUtils.prepareFinalTradeData(tradeData);

    console.log('finalTradeData Data before update:', finalTradeData);
    console.log('Trade Data before insert:', tradeData);

    validateTransaction(db);
    console.log('Transaction validated successfully.');

    await executeTradeTransaction({
      db,
      commodityData,
      finalTradeData,
      tradeData,
      lockCommodityForUpdate,
      lockTradeForUpdate,
      commodityService,
      createTrade,
    });

  } catch (error) {
    console.error('Error placing trade:', error.message);
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
