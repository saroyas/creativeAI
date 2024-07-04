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
    <div className="h-screen">
      <div className="flex grow h-full mx-auto max-w-screen-md px-4 md:px-8">
        <ImagePanel initialImageCode={imageCode} />
      </div>
    </div>
  );
}