'use client';
import { useStreamChat } from '@/features/stream-chat';
import { Button, Container, Input } from '@/shared/components';
import '@livekit/components-styles';
import { useCallback, useState } from 'react';

interface ChatWidgetProps {
  streamId: string;
  serverHistory?: string[];
}
export function ChatWidget({ streamId, serverHistory }: ChatWidgetProps) {
  const [inputValue, setInputValue] = useState('');
  const { messages, sendMessage } = useStreamChat({
    streamId,
    serverHistory,
  });

  const handleSendMessage = useCallback(() => {
    sendMessage(inputValue);
    setInputValue('');
  }, [inputValue, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  return (
    <Container className="flex flex-col h-full w-96">
      <div className="flex flex-col gap-4 ">
        <h1 className=" text-xl font-bold ">Чат стрима</h1>

        <div className="h-80 border flex p-2 g-1 overflow-y-auto">
          {messages.map((message, index) => (
            <p key={index}>{message}</p>
          ))}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Input
          type="text"
          value={inputValue}
          placeholder="Write a message..."
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button variant={'default'} onClick={handleSendMessage}>
          Send
        </Button>
      </div>
    </Container>
  );
}
