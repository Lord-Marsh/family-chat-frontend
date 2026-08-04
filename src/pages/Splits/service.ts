import request from '../../utils/request';

export const getSplits = async (page = 1, limit = 10, additionalQuery = '') => {
  return request.get(`/splits?page=${page}&limit=${limit}${additionalQuery}`);
};
