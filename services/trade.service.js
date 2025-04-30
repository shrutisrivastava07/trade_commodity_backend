const {
    createTrade,
    findTradeById,
    updateTradeStatus,
    getAllTrades,
  } = require('../dal/trade.dal');
  
  exports.placeTrade = async (userId, { commodity, quantity, price }) => {
    return createTrade({ commodity, quantity, price, status: 'order_placed', CounterpartyId: userId });
  };
  
  exports.changeTradeStatus = async (userId, tradeId, status) => {
    const trade = await findTradeById(tradeId, userId);
    if (!trade) throw new Error('Trade not found');
    return updateTradeStatus(trade, status);
  };
  
  exports.fetchTrades = async ( page, limit) => {
    const offset = (page - 1) * limit;
    const result = await getAllTrades( offset, limit);
    return {
        

      totalRecords: result.count,
      totalPage: Math.ceil(result.count / limit),
      pageNo: page,
      items: result.rows,
      isSuccess: true,
      message: 'Trades fetched successfully',
      code: 'TRADE_FETCH_SUCCESS',
    };
  };
  