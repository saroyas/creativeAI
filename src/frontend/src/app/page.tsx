import { ChatPanel } from "@/components/chat-panel";
import { Navbar } from "@/components/nav";

export default function Home() {
  return (
    <div>
    <Navbar />
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <ChatPanel />
      </div>
    </div>
    </div>
  );
}
