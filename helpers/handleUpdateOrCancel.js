module.exports = async function handleUpdateOrCancel(action, tradeId, tradeData, fetchExistingTrades, tradeUtils) {
  if (action !== 'UPDATE' && action !== 'CANCEL') return null;

  const existingTrades = await fetchExistingTrades(tradeId);
  tradeUtils.validationBeforeUpdateCancel(existingTrades, tradeData);
  return existingTrades[0] || null;
};
