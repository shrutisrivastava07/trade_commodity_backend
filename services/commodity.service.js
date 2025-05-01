// services/commodity.service.js
const commodityDAL = require('../dal/commodity.dal');

// const insertOrUpdate = async (id, data) => {
//     const existingCommodity = await commodityDAL.getCommodityById(id);
//     if (existingCommodity) {
//         return await commodityDAL.updateCommodity(id, data);
//     } else {
//         return await commodityDAL.createCommodity(data);
//     }
// };
// const create = async (data) => {
//     return await commodityDAL.createCommodity(data);
// };

const getAll = async (page, limit) => {
    return await commodityDAL.getAllCommodities(page, limit);
};

//  exports.fetchTrades = async ( page, limit) => {
//     const offset = (page - 1) * limit;
//     const result = await getAllCommodities( offset, limit);
//   }
  

const getById = async (id) => {
    return await commodityDAL.getCommodityById(id);
};

const update = async (id, data) => {
    console.log('Updating commodity with ID:', id, 'and data:', data);
    const commodityRow = await commodityDAL.getCommodityById(id);
    commodityRow.quantity = data.quantity;
    console.log('Found commodity to update:', commodityRow);
    commodityRow.save();
   // await commodityDAL.updateCommodity(commodityRow);
};

// const remove = async (id) => {
//     return await commodityDAL.deleteCommodity(id);
// };

module.exports = {
    // create,
    // getAll,
    getAll,
     getById,
    update,
    // remove,
    // insertOrUpdate
};
