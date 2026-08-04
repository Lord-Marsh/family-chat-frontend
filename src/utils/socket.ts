import { io, Socket } from 'socket.io-client';

const isProd = import.meta.env.PROD;
const BASE_URL = isProd 
  ? 'https://family-chat-backend-m58u.onrender.com' 
  : 'http://127.0.0.1:5000';

class SocketService {
  private socket: Socket | null = null;
  private readonly SOCKET_URL = BASE_URL;

  connect(token: string) {
    if (!this.socket) {
      this.socket = io(this.SOCKET_URL, {
        query: { token },
        transports: ['websocket', 'polling'],
      });
      
      this.socket.on('connect', () => {
        console.log('✅ Socket connected successfully!');
      });
      
      this.socket.on('connect_error', (err) => {
        console.error('❌ Socket connection error:', err);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
