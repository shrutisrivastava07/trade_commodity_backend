const { validationBeforeUpdateCancel } = require("../utils/trade.utils");


describe('validationBeforeUpdateCancel', () => {
  test('throws error when no existing trades', () => {
    expect(() => validationBeforeUpdateCancel([]))
      .toThrow('Cannot perform UPDATE or CANCEL on a non-existent trade.');
  });

  test('throws error when last trade is already CANCELLED', () => {
    const trades = [{ action: 'CANCEL' }];
    expect(() => validationBeforeUpdateCancel(trades))
      .toThrow('Cannot perform any action after CANCEL.');
  });

  test('does not throw error for valid trade history', () => {
    const trades = [{ action: 'INSERT' }];
    expect(() => validationBeforeUpdateCancel(trades)).not.toThrow();
  });
});
