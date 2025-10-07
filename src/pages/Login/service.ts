import type { LoginResponse } from '../../types';
import request from '../../utils/request';

export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  return request.post('/auth/login', {
    data: { username, password },
  });
}

export async function registerUser(
  username: string,
  email: string,
  password: string,
  displayName?: string
): Promise<LoginResponse> {
  return request.post('/auth/register', {
    data: { username, email, password, displayName },
  });
}