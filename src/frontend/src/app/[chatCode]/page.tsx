import { ChatPanel } from "@/components/chat-panel";
import { useParams } from 'next/navigation';

export default function Home() {
  const params = useParams();
  const chatCode = params.chatCode as string;

  return (
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <ChatPanel chatCode={chatCode} />
      </div>
    </div>
  );
}