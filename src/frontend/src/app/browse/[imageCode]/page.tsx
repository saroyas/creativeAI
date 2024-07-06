"use client";
import { useState, useEffect, useRef } from 'react';
import { ImagePanel } from "@/components/image-panel";
import { event } from 'nextjs-google-analytics';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

interface PageProps {
  params: {
    imageCode: string;
  };
}

export default function Home({ params }: PageProps) {
  const { imageCode } = params;
  const [stack, setStack] = useState([imageCode, imageCode, imageCode, imageCode, imageCode]);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  useEffect(() => {
    event('Share_Image_Opened', {
      category: 'Share_Image_Opened',
      label: imageCode ? 'Share_Image_Opened Chat' : 'New Image',
      value: imageCode ? 1 : 0,
    });
  }, [imageCode]);

  const removeCard = (dir: 'left' | 'right') => {
    setDirection(dir);
    setStack((current) => current.slice(1));
  };

  return (
    <div className="h-[100dvh] flex flex-col">
      <main className="flex-grow flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-md h-[70vh] mx-auto">
          <AnimatePresence initial={false}>
            {stack.map((code, index) => (
              <Card
                key={code + index}
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
  onSwipe: (dir: 'left' | 'right') => void; 
  index: number;
  total: number;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const animControls = {
    initial: { scale: 1, y: index * -10, opacity: 1 - index * 0.15 },
    animate: { 
      scale: 1 - index * 0.05,
      y: index * -20,
      opacity: 1 - index * 0.2,
      zIndex: total - index,
    },
      x: (custom: 'left' | 'right') => custom === 'left' ? -300 : 300,
      scale: 0.5,

    }
  return (
    <motion.div
      ref={cardRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(e, { offset, velocity }) => {
        const swipe = Math.abs(offset.x) * velocity.x;
        if (swipe < -200000) {
          onSwipe('left');
        } else if (swipe > 200000) {
          onSwipe('right');
        }
      }}
      {...animControls}
    >
      <div className="w-full h-full rounded-2xl overflow-hidden shadow-xl">
        <ImagePanel initialImageCode={imageCode} />
      </div>
    </motion.div>
  );
}