const { Sequelize, DataTypes } = require('sequelize');
const dbConfig = require('../config/db.config');

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.commodity = require('./commodity.model')(sequelize, DataTypes);
db.trade = require('./trade.model')(sequelize, DataTypes);

// Relations one-to-many
db.commodity.hasMany(db.trade);
db.trade.belongsTo(db.commodity);

module.exports = db;
