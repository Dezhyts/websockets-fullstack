import { Text } from '@/shared/components';
import { memo } from 'react';

interface ChatMessageProps {
  username: string;
  message: string;
}

export const ChatMessage = memo((props: ChatMessageProps) => {
  const { username, message } = props;

  return (
    <p className="w-full">
      <Text size="xl">
        {username}:{message}
      </Text>
    </p>
  );
});

ChatMessage.displayName = 'ChatMessage';
