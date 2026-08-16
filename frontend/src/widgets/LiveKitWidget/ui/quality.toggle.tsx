'use client';
import { Text } from '@/shared/components';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/shared/components/ui/select';
import { useTracks } from '@livekit/components-react';
import { RemoteTrackPublication, Track, VideoQuality } from 'livekit-client';
import { Settings } from 'lucide-react';
import { RefObject, useState } from 'react';

const items = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p', value: 'high' },
  { label: '720p', value: 'medium' },
  { label: '360p', value: 'low' },
];

export function QualityToggle({
  containerRef,
}: {
  containerRef: RefObject<HTMLElement | null>;
}) {
  const [quality, setQuality] = useState('auto');
  const tracks = useTracks(
    [
      {
        source: Track.Source.Camera,
        withPlaceholder: false,
      },
    ],
    { onlySubscribed: true },
  );
  const videoTrack = tracks[0];

  const handleQuality = (quality: string | null) => {
    const publication = videoTrack?.publication;
    if (!quality) return;
    setQuality(quality);
    if (!(publication instanceof RemoteTrackPublication)) return;

    if (quality === 'auto' || quality === 'high') {
      publication.setVideoQuality(VideoQuality.HIGH);
    } else if (quality === 'medium') {
      publication.setVideoQuality(VideoQuality.MEDIUM);
    } else {
      publication.setVideoQuality(VideoQuality.LOW);
    }
  };

  const currentLabel = items.find((i) => i.value === quality)?.label ?? 'Auto';
  return (
    <div className="absolute top-2 right-2 mr-8">
      <Select items={items} onValueChange={handleQuality} defaultValue={'auto'}>
        <SelectTrigger>
          <Text className="text-white" size="lg">
            {currentLabel}
          </Text>
          <Settings size={16} />
        </SelectTrigger>
        <SelectContent
          align="end"
          side="bottom"
          alignItemWithTrigger={false}
          container={containerRef}
        >
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
