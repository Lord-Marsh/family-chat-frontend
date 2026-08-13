import request from '../../utils/request';

export const getCategories = async () => {
  return request.get('/categories');
};

export const getUsers = async () => {
  return request.get('/users');
};

export const getSplit = async (id: string) => {
  return request.get(`/splits/${id}`);
};

export const updateSplit = async (id: string, data: any) => {
  return request.put(`/splits/${id}`, { data });
};
