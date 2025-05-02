This module handles inserting, updating, and canceling trades in a consistent and transactional manner. It ensures that all related updates to commodities and trades are performed safely using database-level locking and Sequelize transactions.


** To start this service locally use  - node index.js


DIRECTORY STRUCTURE 
/src
  /services
    trade.service       # Integrates with DAL and helper fundtions to calculate quantity of trade
    commodity.service   # Integrares with DAL for CRUD operations for commodities
  /utils
    lockUtils.js        # Helper for locking trade and commodity rows
    tradeUtils.js       # Trade processing utilities (validations, data preparation, etc.)
  /dal
    trade.dal.js        # Data access layer for trades
    commodity.dal.js   # Data access layer for commodities
  /helpers             # helpers for validation and execution of trade transaction  
  /mappers              # To simplify the response for UI
  /models
    index.js            # Sequelize models including `commodity` and `trade`

