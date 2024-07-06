"use client";
import { useState, useEffect } from 'react';
import { ImageCard } from "@/components/image-card";
import { event } from 'nextjs-google-analytics';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface PageProps {
  params: {
    imageCode: string;
  };
}

export default function Home({ params }: PageProps) {
  const { imageCode } = params;
  const [stack, setStack] = useState(["7ae535a2-a505-4d20-8e0a-0ace9cabea8c", "d7b6ac82-530b-45ed-8f51-140fd9cf63f0", "f70723ab-a9e2-48d9-a138-f8b376d9f416", "1aa79fa8-afec-4700-a8bb-8e43940be63d", "6514ec87-a417-40dd-8696-1b19064c449b"]);

  useEffect(() => {
    event('Share_Image_Opened', {
      category: 'Share_Image_Opened',
      label: imageCode ? 'Share_Image_Opened Chat' : 'New Image',
      value: imageCode ? 1 : 0,
    });
  }, [imageCode]);

  const removeCard = () => {
    setStack((current) => current.slice(1));
  };

  return (
    <div className="h-[100dvh] flex flex-col">
      <main className="flex-grow flex items-stretch justify-center">
        <div className="relative w-full h-full">
          <AnimatePresence initial={false}>
            {stack.map((code, index) => (
              <Card
                key={code + index}
                imageCode={code}
                onSwipe={removeCard}
                index={index}
                total={stack.length}
                hidden={index !== 0}  // Only the top card is not hidden
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Card({ imageCode, onSwipe, index, total, hidden }: { 
  imageCode: string; 
  onSwipe: () => void; 
  index: number;
  total: number;
  hidden: boolean;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-5, 5]);

  const animControls = {
    initial: { scale: 1, y: 0, opacity: 1 },
    animate: { 
      scale: 1 - index * 0.02,
      y: index * -5,
      opacity: 1 - index * 0.1,
      zIndex: total - index,
    },
    exit: {
      x: 300,
      opacity: 0,
      transition: { duration: 0.2 }
    },
    transition: { duration: 0.2 }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (Math.abs(swipe) > 50000) {
          onSwipe();
        }
      }}
      {...animControls}
    >
      <ImageCard initialImageCode={imageCode} hidden={hidden} />
    </motion.div>
  );
}