'use client';
import { Container } from '@/shared/components';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

interface LiveKitWidgetProps {
  token: string;
  isOwner: boolean;
}
export function LiveKitWidget({ token, isOwner }: LiveKitWidgetProps) {
  return (
    <Container className="flex flex-col h-full w-full">
      <div className="flex flex-col flex-1 relative">
        <LiveKitRoom
          token={token}
          video={isOwner}
          audio={isOwner}
          connect={true}
          connectOptions={{
            autoSubscribe: true,
            rtcConfig: {
              iceTransportPolicy: 'all',
            },
          }}
          serverUrl="ws://localhost:7880"
          data-lk-theme="default"
          style={{ height: '100%', width: '100%' }}
        >
          <VideoConference />
        </LiveKitRoom>
      </div>
    </Container>
  );
}
