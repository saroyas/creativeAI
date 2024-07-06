import { ImagePanel } from "@/components/image-panel";
import Link from "next/link";

export default function Home() {
  return (
    <div className="h-[100dvh] flex flex-col relative bg-black text-white">
      <Link 
        href="/" 
        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-300"
      >
        <span className="text-2xl leading-none">&times;</span>
      </Link>
      <main className="flex-grow flex items-stretch justify-center p-4">
        <ImagePanel />
      </main>
    </div>
  );
}