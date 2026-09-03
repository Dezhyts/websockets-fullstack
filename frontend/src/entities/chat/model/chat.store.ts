import { create } from 'zustand';

import { Socket } from 'socket.io-client';
import {
  BanUserDto,
  ChatMessageResponse,
  ErrorResponse,
  HistoryChatResponse,
  JoinStreamDto,
  LeaveStreamDto,
  SendMessageDto,
  UserBannedResponse,
} from '@/shared/api/socket.types';
import { createSocketClient } from '@/shared/api/client/socket.client';

interface ChatStoreState {
  socket: Socket | null;
  streamId: string | null;
  isConnected: boolean;
  messages: ChatMessageResponse[];
  chatMessageError: string | null;

  connect: (streamId: string) => void;
  disconnect: () => void;
  sendMessage: (data: Omit<SendMessageDto, 'streamId'>) => void;
  banUser: (data: Omit<BanUserDto, 'streamId'>) => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  socket: null,
  streamId: null,
  isConnected: false,
  messages: [],
  chatMessageError: null,

  connect: (streamId) => {
    if (get().socket) return;

    const socket = createSocketClient('/chat');
    set({ socket, streamId });
    socket.on('connect', () => {
      set({ isConnected: true });
      socket.emit('join_stream', { streamId } as JoinStreamDto);
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('history', (data: HistoryChatResponse) => {
      set({ messages: data.messages });
    });

    socket.on('message', (data: ChatMessageResponse) => {
      set((state) => ({
        messages: [...state.messages, data],
      }));
    });

    socket.on('user_banned', (data: UserBannedResponse) => {
      console.log('User banned:', data.userId);
    });

    socket.on('error', (data: ErrorResponse) => {
      console.log('Socket error:', data.message);

      if (data.code === 'LIMIT_MESSAGE') {
        set({ chatMessageError: data.message });
        setTimeout(() => {
          set({ chatMessageError: null });
        }, 3000);
      }
    });

    socket.connect();
  },

  disconnect: () => {
    const { socket, streamId } = get();
    if (!socket) return;

    socket.emit('leave_stream', { streamId } as LeaveStreamDto);
    socket.removeAllListeners();
    socket.disconnect();
    set({
      socket: null,
      streamId: null,
      isConnected: false,
      messages: [],
      chatMessageError: null,
    });
  },

  sendMessage: (data) => {
    const { socket, streamId } = get();
    if (!socket || !streamId) return;

    socket.emit('send_message', {
      ...data,
      streamId,
    } as SendMessageDto);
  },
  banUser: (data) => {
    const { socket, streamId } = get();
    if (!socket || !streamId) return;

    socket.emit('ban_user', {
      ...data,
      streamId,
    } as BanUserDto);
  },
}));
