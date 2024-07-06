"use client";
import { useState, useEffect } from 'react';
import { ImageCard } from "@/components/image-card";
import { event } from 'nextjs-google-analytics';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface PageProps {
  params: { imageCode: string };
}

export default function Home({ params }: PageProps) {
  const { imageCode } = params;
  const [stack, setStack] = useState([
    "7ae535a2-a505-4d20-8e0a-0ace9cabea8c",
    "d7b6ac82-530b-45ed-8f51-140fd9cf63f0",
    "f70723ab-a9e2-48d9-a138-f8b376d9f416",
    "1aa79fa8-afec-4700-a8bb-8e43940be63d",
    "6514ec87-a417-40dd-8696-1b19064c449b"
  ]);

  useEffect(() => {
    event('Share_Image_Opened', {
      category: 'Share_Image_Opened',
      label: imageCode ? 'Share_Image_Opened Chat' : 'New Image',
      value: imageCode ? 1 : 0,
    });
  }, [imageCode]);

  const removeCard = () => setStack(current => current.slice(1));

  return (
    <div className="h-[100dvh] flex flex-col">
      <main className="flex-grow flex items-stretch justify-center">
        <div className="relative w-full h-full">
          <AnimatePresence initial={false}>
            {stack.map((code, index) => (
              <Card
                key={code}
                imageCode={code}
                onSwipe={removeCard}
                index={index}
                total={stack.length}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function Card({ imageCode, onSwipe, index, total }: { 
  imageCode: string; 
  onSwipe: () => void; 
  index: number;
  total: number;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-100, 100], [-2, 2]);
  const opacity = useTransform(x, [-100, 0, 100], [0.5, 1, 0.5]);

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
    transition: { type: "spring", stiffness: 300, damping: 20 }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{ x, rotate, opacity }}
      drag={index === 0 ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={(_, { offset, velocity }) => {
        const swipe = offset.x * velocity.x;
        if (Math.abs(swipe) > 20000 || Math.abs(offset.x) > 100) {
          onSwipe();
        }
      }}
      {...animControls}
    >
      <ImageCard initialImageCode={imageCode} hidden={index !== 0} />
    </motion.div>
  );
}