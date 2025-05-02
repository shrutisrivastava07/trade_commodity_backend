module.exports = async function executeTradeTransaction({
    db,
    commodityData,
    finalTradeData,
    tradeData,
    lockCommodityForUpdate,
    lockTradeForUpdate,
    commodityService,
    createTrade,
  }) {
    await db.sequelize.transaction(
      {
        isolationLevel: db.Sequelize.Transaction.ISOLATION_LEVELS.REPEATABLE_READ,
      },
      async (transaction) => {
        await lockCommodityForUpdate(commodityData.id, transaction);
        await lockTradeForUpdate(tradeData.tradeId, transaction);
        await commodityService.update(commodityData.id, commodityData, { transaction });
        await createTrade(finalTradeData, { transaction });
      }
    );
  };
  