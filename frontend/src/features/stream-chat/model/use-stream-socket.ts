'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import {
  createSocketClient,
  JoinStreamDto,
  LeaveStreamDto,
  SendMessageDto,
} from '@/shared/api/socket.client';

interface UseStreamChatProps {
  streamId: string;
  serverHistory?: string[];
}

export function useStreamChat({ streamId, serverHistory }: UseStreamChatProps) {
  const socketRef = useRef<Socket | null>(null);

  const [messages, setMessages] = useState<string[]>(() => {
    return serverHistory ?? [];
  });

  useEffect(() => {
    const client = createSocketClient();
    socketRef.current = client;

    client.on('connect', () => {
      client.emit('join_stream', { streamId } as JoinStreamDto);
    });

    client.on('user_joined', (data) => {
      console.log('Новый пользователь в комнате:', data);
    });

    client.on('message', (data: { message: string }) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });

    return () => {
      const leavePayload: LeaveStreamDto = { streamId };
      client.emit('leave_stream', leavePayload);
      client.disconnect();
      socketRef.current = null;
    };
  }, [streamId]);

  const sendMessage = (message: string) => {
    const socket = socketRef.current;
    if (!socket || !message.trim()) return;

    const payload: SendMessageDto = {
      message,
      streamId,
    };

    socket.emit('send_message', payload);
  };

  return {
    messages,
    sendMessage,
  };
}
