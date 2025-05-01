const { handleTradePlacement } = require("../services/trade.handler");


// Mock dependencies
const mockFetchExistingTrades = jest.fn();
const mockUpdateTradeVersionIdOrGenerateNew = jest.fn();
const mockUpdateCommodityQuantity = jest.fn();
const mockPrepareCommodityData = jest.fn();
const mockPrepareFinalTradeData = jest.fn();
const mockValidateTradeId = jest.fn();
const mockValidationBeforeUpdateCancel = jest.fn();

// Mock data
const tradeData = {
  tradeId: 1,
  type: 'BUY',
  quantity: 10,
  action: 'INSERT',
  commodity: { id: 101, name: 'TCS' }
};

describe('handleTradePlacement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should handle INSERT action correctly', async () => {
    mockUpdateTradeVersionIdOrGenerateNew.mockResolvedValue();
    mockUpdateCommodityQuantity.mockResolvedValue(110);
    mockPrepareCommodityData.mockReturnValue({ id: 101, updatedQuantity: 110 });
    mockPrepareFinalTradeData.mockReturnValue({ tradeId: 1, processed: true });

    const result = await handleTradePlacement({
      tradeData,
      fetchExistingTrades: mockFetchExistingTrades,
      updateTradeVersionIdOrGenerateNew: mockUpdateTradeVersionIdOrGenerateNew,
      updateCommodityQuantity: mockUpdateCommodityQuantity,
      prepareCommodityData: mockPrepareCommodityData,
      prepareFinalTradeData: mockPrepareFinalTradeData,
      validateTradeId: mockValidateTradeId,
      validationBeforeUpdateCancel: mockValidationBeforeUpdateCancel,
    });

    expect(mockValidateTradeId).not.toHaveBeenCalled();
    expect(mockFetchExistingTrades).not.toHaveBeenCalled();
    expect(mockUpdateTradeVersionIdOrGenerateNew).toHaveBeenCalled();
    expect(mockUpdateCommodityQuantity).toHaveBeenCalled();
    expect(mockPrepareCommodityData).toHaveBeenCalledWith(tradeData.commodity, 110);
    expect(mockPrepareFinalTradeData).toHaveBeenCalledWith(tradeData);

    expect(result).toEqual({
      commodityData: { id: 101, updatedQuantity: 110 },
      finalTradeData: { tradeId: 1, processed: true }
    });
  });

  test('should handle UPDATE action and validate trade', async () => {
    const updateTrade = { ...tradeData, action: 'UPDATE' };
    mockFetchExistingTrades.mockResolvedValue([{ id: 'mockTrade' }]);
    mockUpdateTradeVersionIdOrGenerateNew.mockResolvedValue();
    mockUpdateCommodityQuantity.mockResolvedValue(95);
    mockPrepareCommodityData.mockReturnValue({ id: 101, updatedQuantity: 95 });
    mockPrepareFinalTradeData.mockReturnValue({ tradeId: 1, updated: true });

    const result = await handleTradePlacement({
      tradeData: updateTrade,
      fetchExistingTrades: mockFetchExistingTrades,
      updateTradeVersionIdOrGenerateNew: mockUpdateTradeVersionIdOrGenerateNew,
      updateCommodityQuantity: mockUpdateCommodityQuantity,
      prepareCommodityData: mockPrepareCommodityData,
      prepareFinalTradeData: mockPrepareFinalTradeData,
      validateTradeId: mockValidateTradeId,
      validationBeforeUpdateCancel: mockValidationBeforeUpdateCancel,
    });

    expect(mockValidateTradeId).toHaveBeenCalledWith(updateTrade);
    expect(mockFetchExistingTrades).toHaveBeenCalledWith(updateTrade.tradeId);
    expect(mockValidationBeforeUpdateCancel).toHaveBeenCalledWith([{ id: 'mockTrade' }]);
    expect(mockUpdateTradeVersionIdOrGenerateNew).toHaveBeenCalled();
    expect(mockUpdateCommodityQuantity).toHaveBeenCalled();
    expect(result).toEqual({
      commodityData: { id: 101, updatedQuantity: 95 },
      finalTradeData: { tradeId: 1, updated: true }
    });
  });

  test('should handle CANCEL action and validate trade', async () => {
    const cancelTrade = { ...tradeData, action: 'CANCEL' };
    mockFetchExistingTrades.mockResolvedValue([{ id: 'mockTrade' }]);
    mockUpdateTradeVersionIdOrGenerateNew.mockResolvedValue();
    mockUpdateCommodityQuantity.mockResolvedValue(80);
    mockPrepareCommodityData.mockReturnValue({ id: 101, updatedQuantity: 80 });
    mockPrepareFinalTradeData.mockReturnValue({ tradeId: 1, canceled: true });

    const result = await handleTradePlacement({
      tradeData: cancelTrade,
      fetchExistingTrades: mockFetchExistingTrades,
      updateTradeVersionIdOrGenerateNew: mockUpdateTradeVersionIdOrGenerateNew,
      updateCommodityQuantity: mockUpdateCommodityQuantity,
      prepareCommodityData: mockPrepareCommodityData,
      prepareFinalTradeData: mockPrepareFinalTradeData,
      validateTradeId: mockValidateTradeId,
      validationBeforeUpdateCancel: mockValidationBeforeUpdateCancel,
    });

    expect(mockValidateTradeId).toHaveBeenCalledWith(cancelTrade);
    expect(mockFetchExistingTrades).toHaveBeenCalledWith(cancelTrade.tradeId);
    expect(mockValidationBeforeUpdateCancel).toHaveBeenCalledWith([{ id: 'mockTrade' }]);
    expect(result).toEqual({
      commodityData: { id: 101, updatedQuantity: 80 },
      finalTradeData: { tradeId: 1, canceled: true }
    });
  });
});
