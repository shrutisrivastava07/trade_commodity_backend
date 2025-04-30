const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Counterparty = require('./counterparty.model')(sequelize, DataTypes);
db.Trade = require('./trade.model')(sequelize, DataTypes);

// Relations
db.Counterparty.hasMany(db.Trade);
db.Trade.belongsTo(db.Counterparty);

module.exports = db;
