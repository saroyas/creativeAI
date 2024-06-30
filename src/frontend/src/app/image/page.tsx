import { ImagePanel } from "@/components/image-panel";

export default function Home() {
  return (
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <ImagePanel />
      </div>
    </div>
  );
}
