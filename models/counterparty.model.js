 const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const Counterparty = sequelize.define('Counterparty', {
    username: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
  });

  Counterparty.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 10);
  });

  return Counterparty;
};
