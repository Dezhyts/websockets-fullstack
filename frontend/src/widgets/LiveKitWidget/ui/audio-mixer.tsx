'use client';
import { Button } from '@/shared/components';
import { useTracks } from '@livekit/components-react';
import { RemoteAudioTrack, Track } from 'livekit-client';
import { Volume, Volume2, VolumeX } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AudioMixer() {
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const audioSearchTracks = useTracks(
    [{ source: Track.Source.Microphone, withPlaceholder: false }],
    { onlySubscribed: false },
  );

  useEffect(() => {
    const audioTrack = audioSearchTracks[0];
    const track = audioTrack?.publication?.track;
    if (!(track instanceof RemoteAudioTrack)) return;

    const currentVolume = isMuted ? 0 : volume / 100;
    track.setVolume(currentVolume);
  }, [audioSearchTracks, isMuted, volume]);

  const levelVolumeIcon = () => {
    if (isMuted || volume === 0) {
      return <VolumeX size={16} />;
    }
    if (isMuted || volume === 30) {
      return <Volume size={16} />;
    }

    return <Volume2 size={16} />;
  };

  return (
    <div className="absolute top-2 lef-2 z-20 flex gap-1  item-center">
      <Button variant="ghost" onClick={() => setIsMuted(!isMuted)}>
        {levelVolumeIcon()}
      </Button>

      <input
        className="w-32"
        type="range"
        min={'0'}
        max={'100'}
        onChange={(e) => {
          setVolume(Number(e.target.value));
          if (isMuted) setIsMuted(false);
        }}
        value={isMuted ? 0 : volume}
      />
    </div>
  );
}
