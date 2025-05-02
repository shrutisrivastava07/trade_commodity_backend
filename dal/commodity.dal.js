// dal/commodity.dal.js
;
const db = require('../models');

// const createCommodity = async (data) => {
//     return await commodity.create(data);
// };

exports.getAllCommodities = async (page, limit) => {
  
    return db.commodity.findAndCountAll({
        page,
        limit,
      });
};

// const getCommodityById = async (id) => {
//     return await commodity.findByPk(id);
// };

// const updateCommodity = async (id, data) => {
//     console.log('Inside Updating commodity with ID:', id, 'and data:', data);
//     const commodityRow = await commodity.findByPk(id);
//     console.log('Found commodity to update:', commodityRow);
//     if (!commodityRow) return null;
//     return await commodity.update(data);
// };

exports.updateCommodity = async (commodity, options={}) => {
    console.log('Inside Updating commodity with ID:', commodity.id, 'and data:', commodity);
    await commodity.save({ transaction: options.transaction });
     console.log(' Updated  commodity with ID:', commodity);

     return commodity;
  };

  exports.getCommodityById = async (id) => {
    return db.commodity.findOne({ where: { id: id} });
  };

// const deleteCommodity = async (id) => {
//     const commodity = await commodity.findByPk(id);
//     if (!commodity) return null;
//     await commodity.destroy();
//     return true;
// };

// module.exports = {
//     createCommodity,
//     getAllCommodities,
//     getCommodityById,
//  //   updateCommodity,
//     deleteCommodity,
// };
