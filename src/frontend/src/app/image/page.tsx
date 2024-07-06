import { ImagePanel } from "@/components/image-panel";

export default function Home() {
  return (
    <div className="h-[100dvh] flex flex-col">
      <main className="flex-grow flex items-stretch justify-center">
        <ImagePanel />
      </main>
    </div>
  );
}