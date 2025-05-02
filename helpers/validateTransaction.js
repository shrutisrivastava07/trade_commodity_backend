module.exports = function validateTransaction(db) {
    if (!db.sequelize?.transaction) {
      throw new Error('Database transaction method is not available.');
    }
  };
  