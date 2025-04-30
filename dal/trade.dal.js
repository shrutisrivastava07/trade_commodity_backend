const db = require('../models');

exports.createTrade = async (tradeData) => {
  return db.Trade.create(tradeData);
};

exports.findTradeById = async (tradeId, userId) => {
  return db.Trade.findOne({ where: { id: tradeId, CounterpartyId: userId } });
};

exports.updateTradeStatus = async (trade, status) => {
  trade.status = status;
  return trade.save();
};

exports.getAllTrades = async ( offset, limit) => {
  return db.Trade.findAndCountAll({
   
    offset,
    limit,
  });
};
