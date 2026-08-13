import request from '../../utils/request';

export const getBalances = async () => {
  return request.get('/balances');
};

export const remindAllWhatsapp = async () => {
  return request.post('/splits/remind-all-whatsapp');
};
