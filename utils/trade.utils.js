const { fetchExistingTrades, fetchTradeByIdAndAction, generateNewTradeId } = require('../dal/trade.dal');
const commodityService = require('../services/commodity.service');





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

//   if (!tradeData.tradeId) {
//     throw new Error('Cannot perform UPDATE or CANCEL without a trade id.');
//   }

//   const existingTrades = await fetchExistingTrades(tradeData.tradeId);
//   const lastInsertedTrade = await fetchTradeByIdAndAction(tradeData.tradeId, 'INSERT');

//   if (existingTrades.length === 0) {
//     throw new Error('Cannot perform UPDATE or CANCEL on a non-existent trade.');
//   }
//      const latestTrade = existingTrades[0];
  //validateLatestTrade(latestTrade, tradeData.action);

//   console.log('Latest Trade:', latestTrade);
//   tradeData.tradeVersionId = parseInt(latestTrade.tradeVersionId) + 1;
//   console.log(' trade data version ', tradeData.tradeVersionId);
  updateTradeVersionId(tradeData, latestTrade);

  //return await updateCommodityQuantity(lastInsertedTrade, tradeData, tradeData.action);
//   if (tradeData.action === 'UPDATE') {
//   } else if (tradeData.action === 'CANCEL') {
//     return await updateCommodityQuantity(lastInsertedTrade, tradeData tradeData.action);

//  //   return await commodityService.getById(tradeData.commodity.id).then(c => c.quantity);
//   } else {
//     throw new Error('Invalid action.');
//   }
}

async function updateTradeVersionIdOrGenerateNew(tradeData, action, lastTrade = null ) {
    if (action === 'INSERT') {
        tradeData.tradeId = await generateNewTradeId();
        console.log('Generated Trade ID:', tradeData.tradeId);
        tradeData.tradeVersionId = 1;
    } else if (lastTrade) {
        console.log('Last Trade:', lastTrade);
        tradeData.tradeVersionId = parseInt(lastTrade.tradeVersionId) + 1;
        console.log('Updated trade data version:', tradeData.tradeVersionId);
    } else {
        throw new Error('Latest trade data is required for non-INSERT actions.');
    }
}
function validationBeforeUpdateCancel(existingTrades) {
  
    if (existingTrades.length === 0) {
        throw new Error('Cannot perform UPDATE or CANCEL on a non-existent trade.');
      }
      else if (existingTrades[0].action === 'CANCEL') {
        throw new Error('Cannot perform any action after CANCEL.');
      }
 
}
function validateTradeId( tradeData) {
    if (!tradeData.tradeId) {
        throw new Error('Cannot perform UPDATE or CANCEL without a trade id.');
      }
   
 
}

async function updateCommodityQuantity(tradeData, action) {
    console.log('Updating commodity quantity for trade:', tradeData);

    const commodity = await commodityService.getById(tradeData.commodity.id);

    switch (action) {
        case 'INSERT':
            if (tradeData.type === 'BUY') {
                return commodity.quantity + tradeData.quantity;
            } else if (tradeData.type === 'SELL') {
                return commodity.quantity - tradeData.quantity;
            }
            break;

        case 'UPDATE': {
            const lastInsertedTrade = await fetchTradeByIdAndAction(tradeData.tradeId, 'INSERT');
            console.log('lastInsertedTrade commodity:', lastInsertedTrade);

            const lastQty = lastInsertedTrade.type === 'BUY' ? lastInsertedTrade.quantity : -lastInsertedTrade.quantity;
            const currentQty = tradeData.type === 'BUY' ? tradeData.quantity : -tradeData.quantity;
            console.log('Last Qty:', lastQty, 'Current Qty:', currentQty);
            return commodity.quantity + currentQty - lastQty;
        }

        case 'CANCEL': {
            const lastInsertedTrade = await fetchTradeByIdAndAction(tradeData.tradeId, 'INSERT');
            console.log('lastInsertedTrade commodity:', lastInsertedTrade);

            const lastQty = lastInsertedTrade.type === 'BUY' ? lastInsertedTrade.quantity : -lastInsertedTrade.quantity;
            console.log('Action is CANCEL. Returning current commodity quantity:', commodity.quantity + lastQty);
            return commodity.quantity - lastQty; // Reverting last action
        }

        default:
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
    validationBeforeUpdateCancel,
    validateTradeId,
  updateCommodityQuantity,
  prepareCommodityData,
  prepareFinalTradeData,
  handleUpdateOrCancelAction,
  addActionButtons,
  updateTradeVersionIdOrGenerateNew
};
