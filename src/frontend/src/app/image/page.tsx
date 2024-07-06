import { ImagePanel } from "@/components/image-panel";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <ImagePanel />
      </main>
    </div>
  );
}
