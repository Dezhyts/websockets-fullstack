'use client';
import { Container } from '@/shared/components';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import '@livekit/components-styles';
import { useRef } from 'react';
import { AudioMixer } from './audio-mixer';
import { FullScreenToggle } from './fullscreen-toggle';
import { QualityToggle } from './quality.toggle';
import { StreamVideo } from './stream-video';

interface LiveKitWidgetProps {
  token: string;
  isOwner: boolean;
}

export function LiveKitWidget({ token, isOwner }: LiveKitWidgetProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Container className="flex flex-col h-full w-full">
      <div
        className="flex flex-col flex-1 relative bg-neutral-900 rounded-lg overflow-hidden"
        ref={ref}
      >
        <LiveKitRoom
          token={token}
          video={isOwner}
          audio={isOwner}
          connect={true}
          connectOptions={{
            autoSubscribe: true,
            rtcConfig: { iceTransportPolicy: 'all' },
          }}
          serverUrl="ws://localhost:7880"
          data-lk-theme="default"
          style={{ height: '100%', width: '100%' }}
        >
          <StreamVideo />

          <AudioMixer />
          <RoomAudioRenderer />

          <QualityToggle containerRef={ref} />
          <FullScreenToggle targetRef={ref} />
        </LiveKitRoom>
      </div>
    </Container>
  );
}
