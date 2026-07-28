import { getToken } from '@/shared/api/client';
import { ChatWidget } from '@/widgets/ChatWidget';
import { LiveKitWidget } from '@/widgets/LiveKitWidget';
import '@livekit/components-styles';

interface StreamPageProps {
  params: Promise<{
    streamId: string;
  }>;
  searchParams: Promise<{
    role?: string;
  }>;
}

const generateRandomUser = () => `user_${Math.floor(Math.random() * 10000)}`;

export default async function StreamPage(props: StreamPageProps) {
  const resolvedParams = await props.params;
  const resolvedSearchParams = await props.searchParams;
  const streamId = resolvedParams.streamId;

  const clientRole =
    resolvedSearchParams.role?.toLowerCase() === 'streamer'
      ? 'streamer'
      : 'viewer';

  const randomUser = generateRandomUser();
  let token = '';

  try {
    const response = await getToken(streamId, randomUser, clientRole);
    token = response?.token || '';
  } catch (error) {
    console.error(error);
  }

  if (!token) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="animate-pulse">Подключение к трансляции...</span>
      </div>
    );
  }
  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <div className="flex-1 flex p-4 h-full">
        <LiveKitWidget token={token} isOwner={clientRole === 'streamer'} />
      </div>
      <ChatWidget streamId={streamId} />
    </div>
  );
}
