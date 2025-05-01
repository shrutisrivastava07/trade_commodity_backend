const db = require('../models');

exports.createTrade = async (tradeData) => {
  console.log('Trade Data before insert', tradeData);

  const data = await  db.trade.create(tradeData);
  console.log('Trade Data after insert', data);
  return data;
};



// async function fetchExistingTrades(tradeId) {
  exports.fetchExistingTrades = async (tradeId) => {
  return db.trade.findAll({
    where: { tradeId: tradeId },
    order: [['tradeVersionId', 'DESC']],
  });
}
exports.fetchTradeByIdAndAction = async (tradeId, action) => {
  return db.trade.findOne({
    where: { tradeId: tradeId, action: action },
  });
};

exports.getLatestInsertedTrades = async () => {
  return db.trade.findAll({
    attributes: {
      include: [
        [db.Sequelize.fn('MAX', db.Sequelize.col('tradeId')), 'latestTradeId'],
        [db.Sequelize.col('commodity.name'), 'commodityName']
      ]
    },
    where: { action: 'INSERT' },
    include: [
      {
        model: db.commodity,
        attributes: ['id', 'code', 'name'],
      }
    ],
    group: ['trade.id', 'commodity.id'],
    order: [[db.Sequelize.fn('MAX', db.Sequelize.col('tradeId')), 'DESC']],
  });
};

// async function generateNewTradeId() {
  exports.generateNewTradeId = async () => {
    const maxTrade = await db.trade.findOne({
      attributes: [[db.Sequelize.fn('MAX', db.Sequelize.col('tradeId')), 'maxId']],
    });
    const maxId = maxTrade?.dataValues?.maxId ?? 0; // Handle null or undefined
    return (maxId || 0) + 1; // Ensure maxId is treated as 0 if the table is empty
  };

exports.findTradeById = async (tradeId, userId) => {
  return db.trade.findOne({ where: { id: tradeId, CounterpartyId: userId } });
};

exports.updateTradeStatus = async (trade, status) => {
  trade.status = status;
  return trade.save();
};

exports.getAllTrades = async (offset, limit, filter = {}) => {
  const whereClause = {};
  const commodityWhereClause = {};

  // Dynamically build the where clause based on the filter object
  Object.keys(filter).forEach((key) => {
    if (key === 'commodityCode') {
      commodityWhereClause.code = filter[key];
    } else {
      whereClause[key] = filter[key];
    }
  });

  const result = await db.trade.findAndCountAll({
    offset,
    limit,
    where: whereClause,
    logging : true,
    include: [
      {
        model: db.commodity,
        attributes: ['id', 'code', 'description'],
        where: Object.keys(commodityWhereClause).length ? commodityWhereClause : undefined,
      },
    ],
  });



  console.log('Query Result:', result);
  return result;
};
