import { ImagePanel } from "@/components/image-panel";
import { Navbar } from "@/components/nav";

export default function Home() {
  return (
    <div>
    <Navbar />
    <div className="h-[100dvh] flex flex-col">
      <main className="flex-grow flex items-stretch justify-center">
        <ImagePanel />
      </main>
    </div>
    </div>
  );
}