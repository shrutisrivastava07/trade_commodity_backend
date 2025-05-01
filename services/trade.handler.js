const { fetchTradeByIdAndAction, generateNewTradeId } = require("../dal/trade.dal");
const  commodityService  = require("./commodity.service");

async function handleTradePlacement({
    tradeData,
    fetchExistingTrades,
    updateTradeVersionIdOrGenerateNew,
    updateCommodityQuantity,
    prepareCommodityData,
    prepareFinalTradeData,
    validateTradeId,
    validationBeforeUpdateCancel,
  }) {
    let updatedQuantity = 0;
    let lastTrade = null;
  
    const action = tradeData.action;
  
    if (action === 'UPDATE' || action === 'CANCEL') {
      validateTradeId(tradeData);
      const existingTrades = await fetchExistingTrades(tradeData.tradeId);
      validationBeforeUpdateCancel(existingTrades);
      lastTrade = existingTrades[0] || null;
    }
  
    await updateTradeVersionIdOrGenerateNew(tradeData, action, lastTrade, { generateNewTradeId });
    updatedQuantity = await updateCommodityQuantity(tradeData, action, { commodityService, fetchTradeByIdAndAction});
  
    const commodityData = prepareCommodityData(tradeData.commodity, updatedQuantity);
    const finalTradeData = prepareFinalTradeData(tradeData);
  
    return { commodityData, finalTradeData };
  }
  
  module.exports = { handleTradePlacement };
  