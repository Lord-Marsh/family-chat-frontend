import request from '../../utils/request';

export const getCategories = async () => {
  return request.get('/categories');
};

export const getUsers = async () => {
  return request.get('/users');
};

export const createSplit = async (data: any) => {
  return request.post('/splits', { data });
};
