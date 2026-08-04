import request from '../../utils/request';

export const login = async (data: any) => {
  return request.post('/auth/login', { data });
};