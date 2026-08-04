import request from '../../utils/request';

export const getBalances = async () => {
  return request.get('/balances');
};
