// services/commodity.service.js
const commodityDAL = require('../dal/commodity.dal');



const getAll = async (page, limit) => {
    return await commodityDAL.getAllCommodities(page, limit);
};


  

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


module.exports = {

    getAll,
     getById,
    update,

};
