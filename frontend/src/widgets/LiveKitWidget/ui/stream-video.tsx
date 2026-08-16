'use client';
import {
  GridLayout,
  ParticipantTile,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

export function StreamVideo() {
  const tracks = useTracks([Track.Source.Camera], {
    onlySubscribed: true,
  });

  if (tracks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full text-neutral-400">
        Стрим не активен
      </div>
    );
  }

  return (
    <GridLayout tracks={tracks} style={{ height: '100%' }}>
      <ParticipantTile />
    </GridLayout>
  );
}
