const db = require('../models');

exports.findUserByUsername = async (username) => {
  return db.Counterparty.findOne({ where: { username } });
};

exports.createUser = async (userData) => {
  return db.Counterparty.create(userData);
};
