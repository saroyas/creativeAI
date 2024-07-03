"use client";
import { ImagePanel } from "@/components/image-panel";

interface PageProps {
  params: {
    imageCode: string;
  };
}

export default function Home({ params }: PageProps) {
  const { imageCode } = params;

  return (
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <ImagePanel initialImageCode={imageCode} />
      </div>
    </div>
  );
}