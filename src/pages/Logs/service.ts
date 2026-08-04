import request from '../../utils/request';

export const getLoginLogs = async (page = 1) => {
  return request.get(`/logs/login?page=${page}&limit=20`);
};

export const getEmailLogs = async (page = 1) => {
  return request.get(`/logs/email?page=${page}&limit=20`);
};

export const getActivityLogs = async (page = 1) => {
  return request.get(`/logs/activity?page=${page}&limit=20`);
};
