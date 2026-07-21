'use client';

import {
  createSocketClient,
  JoinStreamDto,
  LeaveStreamDto,
  SendMessageDto,
} from '@/src/shared/api/socket.client';
import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

export default function ChatPage() {
  const streamId = 'test-stream-123';
  const socketRef = useRef<Socket | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const client = createSocketClient();
    socketRef.current = client;
    client.on('connect', () => {
      client.emit('join_stream', { streamId } as JoinStreamDto);
    });

    client.on('user_joined', (data) => {
      console.log('Новый пользователь в комнате:', data);
    });

    client.on('message', (data) => {
      setMessages((prevMessages) => [...prevMessages, data.message]);
    });
    return () => {
      client.emit('leave_stream', { streamId } as LeaveStreamDto);
      client.disconnect();
      socketRef.current = null;
    };
  }, [streamId]);

  const handleSendMessage = () => {
    const socket = socketRef.current;
    if (!socket) return;

    const payload: SendMessageDto = {
      message: inputValue,
      streamId,
    };

    socket.emit('send_message', payload);
    setInputValue('');
  };

  return (
    <div className="flex flex-col p-8 gap-4 max-w-md mx-auto  rounded-lg mt-10 border">
      <h1 className=" text-xl font-bold ">Чат стрима</h1>

      <div className="h-40 border flex flex-col p-2 g-1 overflow-y-auto">
        {messages.map((message, index) => (
          <p key={index}>{message}</p>
        ))}
      </div>
      <input
        className=" border rounded p-2"
        type="text"
        value={inputValue}
        placeholder="Write a message..."
        onChange={(e) => setInputValue(e.target.value)}
      />
      <button
        onClick={handleSendMessage}
        className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded font-medium"
      >
        Send
      </button>
    </div>
  );
}
