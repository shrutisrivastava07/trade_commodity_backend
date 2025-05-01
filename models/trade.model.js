module.exports = (sequelize, DataTypes) => {
  return sequelize.define('trade', {
    transactionID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    tradeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    //  primaryKey: true, // Part of the composite primary key
    },
    tradeVersionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      //primaryKey: true, // Part of the composite primary key
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      //primaryKey: true, // Part of the composite primary key
    },
    action: {
      type: DataTypes.ENUM('INSERT', 'UPDATE', 'CANCEL'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('BUY', 'SELL'),
      allowNull: false,
    },
  }, {
    indexes: [
      {
        unique: true,
        fields: ['tradeId', 'tradeVersionId'], // Optional, but ensures uniqueness
      },
    ],
  });
};