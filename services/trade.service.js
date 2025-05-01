const {
    createTrade,
    findTradeById,
    updateTradeStatus,
    getAllTrades,
    fetchExistingTrades,
    generateNewTradeId,
  } = require('../dal/trade.dal');
const commodityService = require('./commodity.service');
  
  exports.placeTrade = async (tradeData) => {
    try {
      if (tradeData.action === 'INSERT') {
        await handleInsertAction(tradeData);
      } else {
        await handleUpdateOrCancelAction(tradeData);
      }
      const updatedQuantity = await updateCommodityQuantity(tradeData);

      const commodityData = prepareCommodityData(tradeData.commodity, updatedQuantity);
      console.log('Commodity Data before update', commodityData);
      
      await commodityService.update(commodityData.id, commodityData);
      
      console.log('Trade Data before insert', tradeData);
      const finalTradeData = prepareFinalTradeData(tradeData);
      return createTrade(finalTradeData);
    } catch (error) {
      console.error('Error placing trade:', error);
      throw error;
    }
  };

  async function handleInsertAction(tradeData) {
    await getTradeId(tradeData);
   // updateCommodityQuantityOnInsert(tradeData);
  }

  function prepareCommodityData(commodity, updatedQuantity) {
    return {
      id: commodity.id,
      quantity: updatedQuantity,
      code: commodity.code,
    };
  }

  function prepareFinalTradeData(tradeData) {
    return {
      tradeId: tradeData.id,
      tradeVersionId: tradeData.version,
      action: tradeData.action,
      type: tradeData.type,
      quantity: tradeData.quantity,
      commodityId: tradeData.commodity.id,
    };
  }

  function updateCommodityQuantityOnInsert(tradeData) {
    if (tradeData.type === 'BUY') {
      tradeData.quantity = +tradeData.quantity;
    } else if (tradeData.type === 'SELL') {
      tradeData.quantity = -tradeData.quantity;
    }
  }

 async function getTradeId(tradeData) {
  //  tradeData.id = generateNewTradeId();
    tradeData.id = await generateNewTradeId();
    console.log('Generated Trade ID:', tradeData.id);
    tradeData.version = 1;
    }


  async function handleUpdateOrCancelAction(tradeData) {
    console.log('Handling UPDATE or CANCEL action for trade:', tradeData);
    if(tradeData.id === undefined || tradeData.id === null) {
      throw new Error('Cannot perform UPDATE or CANCEL without a trade id.');

    }
    const existingTrades = await fetchExistingTrades(tradeData.id);
  
    if (existingTrades.length === 0) {
      throw new Error('Cannot perform UPDATE or CANCEL on a non-existent trade.');
    }
  
    const latestTrade = existingTrades[0];
  
    validateLatestTrade(latestTrade, tradeData.action);
  
    tradeData.version = latestTrade.version + 1;
  
    if (tradeData.action === 'UPDATE') {
      updateCommodityQuantity(latestTrade, tradeData);
    } else if (tradeData.action !== 'CANCEL') {
      throw new Error('Invalid action.');
    }
  }
  

  function validateLatestTrade(latestTrade, action) {
    if (latestTrade.action === 'CANCEL') {
      throw new Error('Cannot perform any action after CANCEL.');
    }
  }

  async function updateCommodityQuantity( tradeData) {
     let finalQuantity = 0;
    const commodity = await commodityService.getById(tradeData.commodity.id);
    if (tradeData.type === 'BUY') {
      finalQuantity =  commodity.quantity + tradeData.quantity;
    } else if (tradeData.type === 'SELL') {
      finalQuantity = commodity.quantity - tradeData.quantity;
    }
    return finalQuantity;
  
  }

  exports.changeTradeStatus = async (userId, tradeId, status) => {
    const trade = await findTradeById(tradeId, userId);
    if (!trade) throw new Error('trade not found');
    return updateTradeStatus(trade, status);
  };
  
  exports.fetchTrades = async ( page, limit) => {
    const offset = (page - 1) * limit;
    const result = await getAllTrades( offset, limit);
    return result
  };
  