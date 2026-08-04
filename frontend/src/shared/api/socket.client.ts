import { io, Socket } from 'socket.io-client';
import { components } from './schema.gen';

export const createSocketClient = (): Socket => {
  return io('http://localhost:3000', {
    transports: ['websocket'],
    withCredentials: true,
  });
};

export type JoinStreamDto = components['schemas']['JoinStreamDto'];
export type LeaveStreamDto = components['schemas']['LeaveStreamDto'];
export type SendMessageDto = components['schemas']['SendMessageDto'];
