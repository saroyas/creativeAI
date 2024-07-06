"use client";
import { ImagePanel } from "@/components/image-panel";
import { useEffect } from 'react';
import { event } from 'nextjs-google-analytics';
import Link from "next/link";

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
    <div className="h-[100dvh] flex flex-col relative bg-black text-white">
      <Link 
        href="/" 
        className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 transition-colors duration-300 z-10"
      >
        <span className="text-2xl leading-none">&times;</span>
      </Link>
      <main className="flex-grow flex items-stretch justify-center p-4">
        <ImagePanel initialImageCode={imageCode} />
      </main>
    </div>
  );
}