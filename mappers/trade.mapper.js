'use strict';
const _ = require('lodash');


exports.toModel = (entity) => {
  // console.log('Entity in toModel:', entity);
   if (!entity) return null;
    const model = {
     transactionID: entity.transactionID,
     tradeId: entity.tradeId,
     tradeVersionId: entity.tradeVersionId,
     quantity: entity.quantity,
     action: entity.action,
     type: entity.type,
     updatedAt: entity.updatedAt,
     
     commodityId: entity.commodity.id,
     commodityCode: entity.commodity.code,
     commodityDescription: entity.commodity.description,
     showCancel: entity.showCancel,
     showUpdate: entity.showUpdate,
    };

     return model;
};

exports.toWebModel = (entities) => {
     return _.map(entities, exports.toModel);
};
