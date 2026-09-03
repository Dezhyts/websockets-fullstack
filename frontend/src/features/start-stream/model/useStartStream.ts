'use client';

import { createStreamIngress } from '@/shared/api/client/client';
import { useMutation } from '@tanstack/react-query';

export function useStartStream(roomName: string) {
  const mutation = useMutation({
    mutationFn: () => createStreamIngress(roomName),
  });

  return {
    isLoading: mutation.isPending,
    ingress: mutation.data?.data ?? null,
    generateStreamKeys: mutation.mutate,
    error: mutation.error,
  };
}
