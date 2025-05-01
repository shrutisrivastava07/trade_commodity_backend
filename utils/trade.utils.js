const { fetchExistingTrades, fetchTradeByIdAndAction, generateNewTradeId } = require('../dal/trade.dal');
const commodityService = require('../services/commodity.service');

async function handleInsertAction(tradeData) {
  tradeData.tradeId = await generateNewTradeId();
  console.log('Generated Trade ID:', tradeData.tradeId);
  tradeData.tradeVersionId = 1;
}

async function updateCommodityQuantityOnInsert(tradeData) {
  const commodity = await commodityService.getById(tradeData.commodity.id);
  if (tradeData.type === 'BUY') {
    return commodity.quantity + tradeData.quantity;
  } else if (tradeData.type === 'SELL') {
    return commodity.quantity - tradeData.quantity;
  }
  return commodity.quantity;
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
    tradeId: tradeData.tradeId,
    tradeVersionId: tradeData.tradeVersionId,
    action: tradeData.action,
    type: tradeData.type || '',
    quantity: tradeData.quantity||0,
    commodityId: tradeData.commodity.id,
  };
}

async function handleUpdateOrCancelAction(tradeData) {
  console.log('Handling UPDATE or CANCEL action for trade:', tradeData);

  if (!tradeData.tradeId) {
    throw new Error('Cannot perform UPDATE or CANCEL without a trade id.');
  }

  const existingTrades = await fetchExistingTrades(tradeData.tradeId);
  const lastInsertedTrade = await fetchTradeByIdAndAction(tradeData.tradeId, 'INSERT');

  if (existingTrades.length === 0) {
    throw new Error('Cannot perform UPDATE or CANCEL on a non-existent trade.');
  }
     const latestTrade = existingTrades[0];
  validateLatestTrade(latestTrade, tradeData.action);

//   console.log('Latest Trade:', latestTrade);
//   tradeData.tradeVersionId = parseInt(latestTrade.tradeVersionId) + 1;
//   console.log(' trade data version ', tradeData.tradeVersionId);
  updateTradeVersionId(tradeData, latestTrade);

  return await updateCommodityQuantity(lastInsertedTrade, tradeData, tradeData.action);
//   if (tradeData.action === 'UPDATE') {
//   } else if (tradeData.action === 'CANCEL') {
//     return await updateCommodityQuantity(lastInsertedTrade, tradeData tradeData.action);

//  //   return await commodityService.getById(tradeData.commodity.id).then(c => c.quantity);
//   } else {
//     throw new Error('Invalid action.');
//   }
}

function updateTradeVersionId(tradeData,latestTrade ){

  console.log('Latest Trade:', latestTrade);
  tradeData.tradeVersionId = parseInt(latestTrade.tradeVersionId) + 1;
  console.log(' trade data version ', tradeData.tradeVersionId);

}

function validateLatestTrade(latestTrade, action) {
  if (latestTrade.action === 'CANCEL') {
    throw new Error('Cannot perform any action after CANCEL.');
  }
}

async function updateCommodityQuantity(lastInsertedTrade, tradeData, action) {
    console.log('Updating commodity quantity for trade:', tradeData);
    console.log('lastInsertedTrade commodity:', lastInsertedTrade);
    const commodity = await commodityService.getById(tradeData.commodity.id);
    const lastQty = lastInsertedTrade.type === 'BUY' ? lastInsertedTrade.quantity : -lastInsertedTrade.quantity;
    if (action === 'UPDATE') {
        const currentQty = tradeData.type === 'BUY' ? tradeData.quantity : -tradeData.quantity;
        console.log('Last Qty:', lastQty, 'Current Qty:', currentQty);
        return commodity.quantity + currentQty - lastQty;
    } else if (action === 'CANCEL') {
        console.log('Action is CANCEL. Returning current commodity quantity:', commodity.quantity + lastQty);
        return commodity.quantity - lastQty; // Reverting last action
    } else {
        throw new Error('Invalid action for updating commodity quantity.');
    }
}

function addActionButtons(trades) {
    return trades.map((trade) => {
        const isMaxTradeId = trades
            .filter(
                (t) =>
                    t.commodityId === trade.commodityId &&
                    (t.action === 'INSERT' || t.action === 'UPDATE')
            )
            .every((t) => t.tradeId <= trade.tradeId);

        return {
            ...trade,
            showUpdate: isMaxTradeId,
            showCancel: isMaxTradeId,
                transactionID: trade.transactionID,
                tradeId: trade.tradeId,
                tradeVersionId: trade.tradeVersionId,
                action: trade.action,
                type: trade.type,
                quantity: trade.quantity,
               
            
        };
    });
}

module.exports = {
  handleInsertAction,
  updateCommodityQuantityOnInsert,
  prepareCommodityData,
  prepareFinalTradeData,
  handleUpdateOrCancelAction,
  addActionButtons,
};
