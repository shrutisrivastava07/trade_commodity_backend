module.exports = (sequelize, DataTypes) => {
    return sequelize.define('Trade', {
      commodity: DataTypes.STRING,
      quantity: DataTypes.FLOAT,
      price: DataTypes.FLOAT,
      status: {
        type: DataTypes.ENUM('order_placed', 'settled', 'expired', 'cancelled'),
        defaultValue: 'order_placed',
      }
    });
  };
  