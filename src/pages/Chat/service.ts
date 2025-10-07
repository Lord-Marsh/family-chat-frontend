import type { Message, User } from '../../types';
import request from '../../utils/request';

export async function getUsers(): Promise<User[]> {
  return request.get('/chat/users');
}

export async function getMessages(receiverId: string): Promise<Message[]> {
  return request.get(`/chat/messages/${receiverId}`);
}