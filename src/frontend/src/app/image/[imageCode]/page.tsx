"use client";
import { ImagePanel } from "@/components/image-panel";
import { useEffect } from 'react';
import { event } from 'nextjs-google-analytics';

interface PageProps {
  params: {
    imageCode: string;
  };
}

export default function Home({ params }: PageProps) {
  const { imageCode } = params;

  useEffect(() => {
    // Send Google Analytics event when the page loads
    event('Share_Image_Opened', {
      category: 'Share_Image_Opened',
      label: imageCode ? 'Share_Image_Opened Chat' : 'New Image',
      value: imageCode ? 1 : 0,
    });
  }, [imageCode]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <ImagePanel initialImageCode={imageCode} />
      </main>
    </div>
  );
}