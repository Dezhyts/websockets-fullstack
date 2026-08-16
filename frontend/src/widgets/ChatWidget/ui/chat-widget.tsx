'use client';
import { useChatStore } from '@/entities/chat';
import { Button, Container, Input } from '@/shared/components';
import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';

interface ChatWidgetProps {
  streamId: string;
  isAuth: boolean;
}
export function ChatWidget({ streamId, isAuth }: ChatWidgetProps) {
  const [inputValue, setInputValue] = useState('');

  const { messages, isConnected, connect, disconnect, sendMessage } =
    useChatStore(
      useShallow((state) => ({
        messages: state.messages,
        isConnected: state.isConnected,
        connect: state.connect,
        disconnect: state.disconnect,
        sendMessage: state.sendMessage,
      })),
    );

  useEffect(() => {
    connect(streamId);
    return () => {
      disconnect();
    };
  }, [connect, disconnect, streamId]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sendMessage({ message: inputValue });
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Container className="flex flex-col h-full w-96">
      <div className="flex flex-col gap-4 ">
        <h1 className=" text-xl font-bold ">
          Чат стрима {!isConnected && '(connecting...)'}
        </h1>

        <div className="h-80 border flex p-2 g-1 overflow-y-auto">
          {messages.map((message) => (
            <p key={message.id}>
              {message.username}:{message.message}
            </p>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {isAuth ? (
          <>
            <Input
              type="text"
              value={inputValue}
              disabled={!isConnected}
              placeholder="Write a message..."
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              disabled={!isConnected}
              variant="default"
              onClick={handleSendMessage}
            >
              Send
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Войдите, чтобы писать в чат
          </p>
        )}
      </div>
    </Container>
  );
}
