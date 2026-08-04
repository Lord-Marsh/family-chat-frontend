import request from '../../utils/request';

export const getBalancesSummary = async () => {
  return request.get('/balances/summary');
};

export const getRecentSplits = async () => {
  return request.get('/splits?limit=5');
};
