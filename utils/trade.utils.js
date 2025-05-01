
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
      quantity: tradeData.quantity || 0,
      commodityId: tradeData.commodity.id,
    };
  }
  
  function validateTradeId(tradeData) {
    if (!tradeData.tradeId) {
      throw new Error('Cannot perform UPDATE or CANCEL without a trade id.');
    }
  }
  
  function validationBeforeUpdateCancel(existingTrades) {
    if (existingTrades.length === 0) {
      throw new Error('Cannot perform UPDATE or CANCEL on a non-existent trade.');
    } else if (existingTrades[0].action === 'CANCEL') {
      throw new Error('Cannot perform any action after CANCEL.');
    }
  }
  
/**
 * Updates the quantity of a commodity based on the trade action and type.
 *
 *  1. INSERT
 *   Adds or subtracts the trade quantity depending on whether it's a BUY or SELL:
 *   BUY increases the commodity quantity.
 *   SELL decreases it.

 *  2. UPDATE
 *   Adjusts the quantity by:
 *   Reverting the effect of the original trade.
 *   Applying the new trade.
 *   It uses the original trade (INSERT) to compute the previous effect and then applies the new one.
 *
 *  3. CANCEL
 *   Reverts the effect of the original trade by subtracting the quantity it added (if BUY) or adding back the quantity it subtracted (if SELL).   CANCEL: Reverts the commodity's quantity by undoing the impact of the canceled trade.
 *   This logic ensures that the commodity's quantity is always consistent with the trade actions performed.
 *
 * @async
 * @function updateCommodityQuantity
 * @param {Object} tradeData - The trade data object containing details of the trade.
 * @param {string} tradeData.tradeId - The unique identifier of the trade.
 * @param {Object} tradeData.commodity - The commodity involved in the trade.
 * @param {string} tradeData.commodity.id - The unique identifier of the commodity.
 * @param {string} tradeData.type - The type of trade, either 'BUY' or 'SELL'.
 * @param {number} tradeData.quantity - The quantity of the commodity being traded.
 * @param {string} action - The action to perform, one of 'INSERT', 'UPDATE', or 'CANCEL'.
 * @param {Object} services - An object containing service dependencies.
 * @param {Object} services.commodityService - A service for interacting with commodity data.
 * @param {Function} services.commodityService.getById - A method to fetch a commodity by its ID.
 * @param {Function} services.fetchTradeByIdAndAction - A function to fetch a trade by its ID and action type.
 * @returns {Promise<number>} The updated quantity of the commodity.
 * @throws {Error} Throws an error if the action is invalid.
 *
**/
  async function updateCommodityQuantity(tradeData, action, { commodityService, fetchTradeByIdAndAction }) {
    const commodity = await commodityService.getById(tradeData.commodity.id);
  
    switch (action) {
      case 'INSERT':
        return tradeData.type === 'BUY'
          ? commodity.quantity + tradeData.quantity
          : commodity.quantity - tradeData.quantity;
  
      case 'UPDATE': {
        const lastInserted = await fetchTradeByIdAndAction(tradeData.tradeId, 'INSERT');
        const prevQty = lastInserted.type === 'BUY' ? lastInserted.quantity : -lastInserted.quantity;
        const currQty = tradeData.type === 'BUY' ? tradeData.quantity : -tradeData.quantity;
        return commodity.quantity + currQty - prevQty;
      }
  
      case 'CANCEL': {
        const lastInserted = await fetchTradeByIdAndAction(tradeData.tradeId, 'INSERT');
        const revertQty = lastInserted.type === 'BUY' ? lastInserted.quantity : -lastInserted.quantity;
        return commodity.quantity - revertQty;
      }
  
      default:
        throw new Error('Invalid action for updating commodity quantity.');
    }
  }

/**
 * Updates the trade version ID or generates a new trade ID and version ID based on the specified action.
 *
 * @async
 * @function
 * @param {Object} tradeData - The trade data object to be updated.
 * @param {string} action - The action to perform. Should be either 'INSERT' or a non-INSERT action.
 * @param {Object|null} [lastTrade=null] - The last trade data object, required for non-INSERT actions. To check the versionId of the previous trade
 * @param {Object} options - Additional options.
 * @param {Function} options.generateNewTradeId - A function to generate a new trade ID.
 * @throws {Error} Throws an error if `lastTrade` is not provided for non-INSERT actions.
 * @returns {Promise<void>} Resolves when the trade data is updated.
 */
  async function updateTradeVersionIdOrGenerateNew(tradeData, action, lastTrade = null, {generateNewTradeId}) {
    if (action === 'INSERT') {
      tradeData.tradeId = await generateNewTradeId();
      tradeData.tradeVersionId = 1;
    } else if (lastTrade) {
      tradeData.tradeVersionId = parseInt(lastTrade.tradeVersionId) + 1;
    } else {
      throw new Error('Latest trade data is required for non-INSERT actions.');
    }
  }
  

/**
 * This is a critical method - adds whether to show update and cancel actions against a trade in the UI.
 * 
 * If a trade was cancelled, then no action should be visible across all versions of that trade as that is the final state.
 * "INSERT" is always a new trade, and subsequent "UPDATE" actions or one "CANCEL" action can happe unless either the Trade is cancelled or a new trade is inserted for thagt commodity.
 * 
 * @param {Array<Object>} trades - An array of trade objects. Each trade object should contain the following properties:
 *   - commodityId {string}: The ID of the commodity associated with the trade.
 *   - tradeId {number}: The unique identifier for the trade.
 *   - action {string}: The action performed on the trade (e.g., "INSERT", "UPDATE", "CANCEL").
 *   - transactionID {string}: The transaction ID associated with the trade.
 *   - tradeVersionId {number}: The version ID of the trade.
 *   - quantity {number}: The quantity of the trade.
 *   - type {string}: The type of the trade.
 * 
 * @returns {Array<Object>} A new array of trade objects with additional properties:
 *   - showUpdate {boolean}: Indicates whether the "Update" action should be shown for the trade.
 *   - showCancel {boolean}: Indicates whether the "Cancel" action should be shown for the trade.
 */
function addActionButtons(trades) {
    return trades.map((trade) => {
        const isMaxTradeId = trades
            .filter((t) => t.commodityId === trade.commodityId && ['INSERT', 'UPDATE'].includes(t.action))
            .every((t) => t.tradeId <= trade.tradeId) && 
            !trades.some((t) => t.tradeId === trade.tradeId && t.action === 'CANCEL');

        return {
            ...trade,
            showUpdate: isMaxTradeId,
            showCancel: isMaxTradeId,
            transactionID: trade.transactionID,
            tradeId: trade.tradeId,
            tradeVersionId: trade.tradeVersionId,
            quantity: trade.quantity,
            action: trade.action,
            type: trade.type,
        
        };
    });
}
  
  module.exports = {
    prepareCommodityData,
    prepareFinalTradeData,
    validateTradeId,
    validationBeforeUpdateCancel,
    updateCommodityQuantity,
    updateTradeVersionIdOrGenerateNew,
    addActionButtons,
  };
  