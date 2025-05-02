const { lockCommodityForUpdate, lockTradeForUpdate } = require('../lockUtils');
const db = require('../models');

jest.mock('../../models');

describe('lockUtils', () => {
  let transaction;

  beforeEach(() => {
    transaction = { LOCK: { UPDATE: 'UPDATE' }, someContext: 'mockTransaction' };
    jest.clearAllMocks();
  });

  describe('lockCommodityForUpdate', () => {
    it('should return locked commodity when found', async () => {
      const mockCommodity = { id: 1, name: 'TCS' };
      db.commodity.findOne.mockResolvedValue(mockCommodity);

      const result = await lockCommodityForUpdate(1, transaction);
      expect(result).toEqual(mockCommodity);
      expect(db.commodity.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
    });

    it('should throw error when commodity not found', async () => {
      db.commodity.findOne.mockResolvedValue(null);

      await expect(lockCommodityForUpdate(2, transaction)).rejects.toThrow(
        'Commodity with id 2 not found for locking.'
      );
    });
  });

  describe('lockTradeForUpdate', () => {
    it('should return locked trade when found', async () => {
      const mockTrade = { tradeId: 10 };
      db.trade.findOne.mockResolvedValue(mockTrade);

      const result = await lockTradeForUpdate(10, transaction);
      expect(result).toEqual(mockTrade);
      expect(db.trade.findOne).toHaveBeenCalledWith({
        where: { tradeId: 10 },
        lock: transaction.LOCK.UPDATE,
        transaction,
      });
    });

    it('should log message when trade not found', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      db.trade.findOne.mockResolvedValue(null);

      const result = await lockTradeForUpdate(99, transaction);

      expect(result).toBeUndefined(); // since there's no return
      expect(consoleSpy).toHaveBeenCalledWith(
        'No existing trade found for ID 99 — continuing to create new trade.'
      );
    });
  });
});
