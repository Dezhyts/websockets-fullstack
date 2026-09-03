import { io, Socket } from 'socket.io-client';

const BASE_URL = 'http://localhost:3000';

const TEMP_TOKEN = '';

export const createSocketClient = (url: string): Socket => {
  return io(`${BASE_URL}${url}`, {
    transports: ['websocket'],
    withCredentials: true,
    autoConnect: false,
    auth: {
      token: TEMP_TOKEN,
    },
  });
};
