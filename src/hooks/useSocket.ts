import { useEffect } from 'react';
import { socketService } from '../utils/socket';
import { useAuth } from '../contexts/AutoContext';

export const useSocket = (eventName: string, callback: (data: any) => void) => {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;

    const socket = socketService.connect(token);
    
    socket.on(eventName, callback);

    return () => {
      socket.off(eventName, callback);
    };
  }, [eventName, callback, token]);
};
