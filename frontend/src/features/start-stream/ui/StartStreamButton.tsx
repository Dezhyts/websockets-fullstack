'use client';

import { Button, Container, Input } from '@/shared/components';
import { Copy } from 'lucide-react';
import { useStartStream } from '../model/useStartStream';

interface StartStreamButtonProps {
  roomName: string;
}
export function StartStreamButton({ roomName }: StartStreamButtonProps) {
  const { ingress, isLoading, generateStreamKeys, error } =
    useStartStream(roomName);

  if (!ingress) {
    return (
      <div>
        <Button disabled={isLoading} onClick={() => generateStreamKeys()}>
          {isLoading ? 'Загрузка...' : 'Начать трансляцию'}
        </Button>
        {error && <p className="text-destructive">{error.message}</p>}
      </div>
    );
  }

  return (
    <Container className="flex flex-col gap-2 p-4 border border-border">
      <div className="flex items-center gap-2">
        <Input readOnly value={ingress.url} />
        <button onClick={() => navigator.clipboard.writeText(ingress.url)}>
          <Copy size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Input readOnly value={ingress.streamKey} />
        <button
          onClick={() => navigator.clipboard.writeText(ingress.streamKey)}
        >
          <Copy size={16} />
        </button>
      </div>
    </Container>
  );
}
