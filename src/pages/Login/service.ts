import request from '../../utils/request';

export const login = async (data: any) => {
  return request.post('/auth/login', { data });
};

export const generateWebauthnLogin = async (username: string) => {
  return request.post('/webauthn/login/generate', { data: { username } });
};

export const verifyWebauthnLogin = async (username: string, credential: any) => {
  return request.post('/webauthn/login/verify', { data: { username, credential } });
};