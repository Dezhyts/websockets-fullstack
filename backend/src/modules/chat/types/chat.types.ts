import { Socket } from 'socket.io';

export interface AuthenticatedSocket extends Socket {
  user: {
    id: string;
    username: string;
  };
}

export interface ChatUser {
  id: string;
  username: string;
}

export interface UserJoinedPayload {
  userId: string;
  username: string;
}

export interface MessagePayload {
  userId: string;
  username: string;
  message: string;
  createdAt: string;
}
