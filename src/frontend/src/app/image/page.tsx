import { ImagePanel } from "@/components/image-panel";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center">
        <ImagePanel />
      </main>
    </div>
  );
}
