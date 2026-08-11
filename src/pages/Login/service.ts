import request from '../../utils/request';

export const login = async (data: any) => {
  return request.post('/auth/login', { data });
};

export const generateWebauthnLogin = async () => {
  return request.post('/webauthn/login/generate', { data: {} });
};

export const verifyWebauthnLogin = async (credential: any) => {
  return request.post('/webauthn/login/verify', { data: { credential } });
};