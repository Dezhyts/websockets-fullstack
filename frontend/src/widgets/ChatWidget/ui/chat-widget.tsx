'use client';
import { useChatStore } from '@/entities/chat';
import { Button, Container, Input, Text } from '@/shared/components';
import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { ChatMessage } from './chat-message';
import { useThrottleCallback } from '@/shared/hooks/useThrottle';

interface ChatWidgetProps {
  streamId: string;
  isAuth: boolean;
}
export function ChatWidget({ streamId, isAuth }: ChatWidgetProps) {
  const [inputValue, setInputValue] = useState('');

  const {
    messages,
    isConnected,
    connect,
    disconnect,
    sendMessage,
    chatMessageError,
  } = useChatStore(
    useShallow((state) => ({
      messages: state.messages,
      isConnected: state.isConnected,
      connect: state.connect,
      disconnect: state.disconnect,
      sendMessage: state.sendMessage,
      chatMessageError: state.chatMessageError,
    })),
  );

  useEffect(() => {
    connect(streamId);
    return () => {
      disconnect();
    };
  }, [connect, disconnect, streamId]);

  const handleSendMessage = useThrottleCallback(() => {
    if (!inputValue.trim() || !!chatMessageError) return;
    sendMessage({ message: inputValue });
    setInputValue('');
  }, 200);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <Container className="flex flex-col h-full w-96">
      <div className="flex flex-col gap-4 ">
        <Text size="2xl">Чат стрима {!isConnected && '(connecting...)'}</Text>

        <div className="h-80 flex flex-col gap-1 border p-2 overflow-y-auto overflow-x-hidden">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              username={message.username}
              message={message.message}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        {isAuth && chatMessageError && <div>{chatMessageError}</div>}
        {isAuth ? (
          <>
            <Input
              type="text"
              value={inputValue}
              disabled={!isConnected || !!chatMessageError}
              placeholder="Write a message..."
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button
              disabled={!isConnected || !!chatMessageError}
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
