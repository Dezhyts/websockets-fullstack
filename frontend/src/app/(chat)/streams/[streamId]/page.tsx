import { StartStreamButton } from '@/features/start-stream';
import { getStreamIngresToken } from '@/shared/api/client/client';
import { ChatWidget } from '@/widgets/ChatWidget';
import { LiveKitWidget } from '@/widgets/LiveKitWidget';
import { notFound } from 'next/navigation';

interface StreamPageProps {
  params: Promise<{
    streamId: string;
  }>;
}

export default async function StreamPage(props: StreamPageProps) {
  const resolvedParams = await props.params;
  const streamId = resolvedParams.streamId;

  const result = await getStreamIngresToken(streamId);

  if (result.isError && result.status === 404) {
    notFound();
  }
  console.log('API Result Data:', result.data);
  console.log('Computed isAuth:', !!result.data?.isAuth);
  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      <div className="flex-1 flex p-4 h-full">
        {result.isError ? (
          <div>
            <h1>Not authorized to watch stream</h1>
          </div>
        ) : (
          <>
            {result.data.isOwner && <StartStreamButton roomName={streamId} />}
            <LiveKitWidget
              token={result.data.streamToken}
              isOwner={result.data.isOwner}
            />
          </>
        )}
      </div>
      <ChatWidget streamId={streamId} isAuth={!!result.data?.isAuth} />
    </div>
  );
}
