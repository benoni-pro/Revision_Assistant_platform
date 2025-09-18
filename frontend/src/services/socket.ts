import { io, Socket } from 'socket.io-client';
import { tokenManager } from './api';

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (socket) return socket;
  const token = tokenManager.getAccessToken();
  socket = io((import.meta.env.VITE_SOCKET_URL as string) || 'http://localhost:5000', {
    transports: ['websocket'],
    withCredentials: true,
    auth: { token },
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default getSocket;

