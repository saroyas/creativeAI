"use client";
import { ChatPanel } from "@/components/chat-panel";
import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { event } from 'nextjs-google-analytics';
import { Navbar } from "@/components/nav";

export default function Home() {
  const params = useParams();
  const chatCode = params.chatCode as string;

  useEffect(() => {
    // Send Google Analytics event when the page loads
    event('Share_Chat_Opened', {
      category: 'Share_Chat_Opened',
      label: chatCode ? 'Share_Chat_Opened Chat' : 'New Chat',
      value: chatCode ? 1 : 0,
    });
  }, [chatCode]);

  return (
    <div>
    <Navbar />
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
      <ChatPanel chatCode={chatCode} />
      </div>
    </div>
    </div>
  );
}