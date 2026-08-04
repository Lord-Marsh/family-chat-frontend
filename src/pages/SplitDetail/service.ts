import request from '../../utils/request';

export const getSplit = async (id: string) => {
  return request.get(`/splits/${id}`);
};

export const settleSplit = async (id: string, data: any) => {
  return request.post(`/splits/${id}/settle`, { data });
};

export const revertSettlement = async (id: string, settlementId: string) => {
  return request.put(`/splits/${id}/settle/${settlementId}`, { data: { action: 'revert' } });
};

export const deleteSplit = async (id: string) => {
  return request.delete(`/splits/${id}`);
};
