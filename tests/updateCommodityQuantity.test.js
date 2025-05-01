
// const { updateCommodityQuantity } = require('../services/trade.handler');

const { updateCommodityQuantity } = require("../utils/trade.utils");

describe('updateCommodityQuantity', () => {
  const mockCommodityService = {
    getById: jest.fn()
  };

  const mockFetchTradeByIdAndAction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('INSERT BUY should add quantity', async () => {
    mockCommodityService.getById.mockResolvedValue({ quantity: 100 });

    const result = await updateCommodityQuantity(
      { type: 'BUY', quantity: 20, commodity: { id: 1 } },
      'INSERT',
      { commodityService: mockCommodityService, fetchTradeByIdAndAction: mockFetchTradeByIdAndAction }
    );

    expect(result).toBe(120);
  });

  test('INSERT SELL should subtract quantity', async () => {
    mockCommodityService.getById.mockResolvedValue({ quantity: 100 });

    const result = await updateCommodityQuantity(
      { type: 'SELL', quantity: 30, commodity: { id: 1 } },
      'INSERT',
      { commodityService: mockCommodityService, fetchTradeByIdAndAction: mockFetchTradeByIdAndAction }
    );

    expect(result).toBe(70);
  });

  test('UPDATE from BUY to SELL should reflect updated quantity', async () => {
    mockCommodityService.getById.mockResolvedValue({ quantity: 100 });
    mockFetchTradeByIdAndAction.mockResolvedValue({ type: 'BUY', quantity: 50 });

    const result = await updateCommodityQuantity(
      { type: 'SELL', quantity: 20, commodity: { id: 1 }, tradeId: 10 },
      'UPDATE',
      { commodityService: mockCommodityService, fetchTradeByIdAndAction: mockFetchTradeByIdAndAction }
    );

    expect(result).toBe(30);
  });

  test('CANCEL a SELL trade should add quantity', async () => {
    mockCommodityService.getById.mockResolvedValue({ quantity: 75 });
    mockFetchTradeByIdAndAction.mockResolvedValue({ type: 'SELL', quantity: 10 });

    const result = await updateCommodityQuantity(
      { tradeId: 13, commodity: { id: 4 } },
      'CANCEL',
      { commodityService: mockCommodityService, fetchTradeByIdAndAction: mockFetchTradeByIdAndAction }
    );

    expect(result).toBe(85);
  });

  test('Invalid action should throw error', async () => {
    mockCommodityService.getById.mockResolvedValue({ quantity: 50 });

    await expect(
      updateCommodityQuantity(
        { type: 'BUY', quantity: 10, commodity: { id: 5 } },
        'UNKNOWN',
        { commodityService: mockCommodityService, fetchTradeByIdAndAction: mockFetchTradeByIdAndAction }
      )
    ).rejects.toThrow('Invalid action for updating commodity quantity.');
  });
});
