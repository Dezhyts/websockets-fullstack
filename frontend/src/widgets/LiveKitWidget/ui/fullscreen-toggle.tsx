'use client';

import { useState, useEffect, RefObject } from 'react';
import { Maximize, Minimize } from 'lucide-react';
import { Button } from '@/shared/components';

export function FullScreenToggle({
  targetRef,
}: {
  targetRef: RefObject<HTMLDivElement | null>;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () =>
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      targetRef.current?.requestFullscreen();
    }
  };

  return (
    <div className="absolute top-2 right-2">
      <Button
        variant="ghost"
        onClick={toggleFullscreen}
        className="flex items-center gap-2 p-2 rounded-lg text-white"
      >
        {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
      </Button>
    </div>
  );
}
