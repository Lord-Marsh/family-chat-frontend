import request from '../../utils/request';

export const getBalancesSummary = async () => {
  return request.get('/balances/summary');
};

export const getRecentSplits = async () => {
  return request.get('/splits?limit=5');
};

export const generateWebauthnRegistration = async () => {
  return request.get('/webauthn/register/generate');
};

export const verifyWebauthnRegistration = async (credential: any) => {
  return request.post('/webauthn/register/verify', { data: credential });
};
