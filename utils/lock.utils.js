// src/services/lockUtils.js

const db = require('../models');

// Helper function to lock commodity for update
exports.lockCommodityForUpdate = async (commodityId, transaction) => {
  const lockedCommodity = await db.commodity.findOne({
    where: { id: commodityId },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  if (!lockedCommodity) {
    throw new Error(`Commodity with id ${commodityId} not found for locking.`);
  }
};

// Helper function to lock trade for update
exports.lockTradeForUpdate = async (tradeId, transaction) => {
  const lockedTrade = await db.trade.findOne({
    where: { tradeId: tradeId },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });

  if (!lockedTrade) {
    console.log(`No existing trade found for ID ${tradeId} — continuing to create new trade.`);
  }
};
