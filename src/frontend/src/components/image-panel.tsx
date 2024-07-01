"use client";
import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { ArrowUp, Image as ImageIcon } from "lucide-react";
import axios from 'axios';
import { env } from "../env.mjs";

const BASE_URL = env.NEXT_PUBLIC_API_URL;

export const ImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateImage = async (promptText: string) => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    setImageUrl("");
    try {
      const response = await axios.post(`${BASE_URL}/image`, { prompt: promptText }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.imageURL) {
        setImageUrl(response.data.imageURL);
      } else if (response.data.error) {
        setError(response.data.error);
      }
    } catch (err) {
      setError("Failed to generate image. Please try again.");
      console.error("Error generating image:", err);
    } finally {
      setIsLoading(false);
      setProgress(100);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 2) return;
    generateImage(prompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : 90));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  const addWatermarkAndDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      // Improved watermark with stronger shadow
      const watermarkText = 'AI Uncensored';
      const fontSize = Math.max(16, canvas.width / 40);
      ctx.font = `bold ${fontSize}px 'Arial', sans-serif`; // Made the font bold
      const padding = fontSize;

      const x = canvas.width - padding;
      const y = canvas.height - padding;

      // Create gradient background (unchanged)
      const gradientHeight = canvas.height / 3;
      const gradient = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);

      // Add text with stronger shadow for better visibility
      ctx.fillStyle = 'rgba(255, 255, 255, 1)'; // Full opacity for text
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      
      // Stronger shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw text multiple times for even stronger effect
      for (let i = 0; i < 3; i++) {
        ctx.fillText(watermarkText, x, y);
      }

      // Reset shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      // Convert to JPEG and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `aiuncensored_${Date.now()}.jpg`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/jpeg', 0.95);
    };
    img.src = imageUrl;
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-grow overflow-auto p-10">
        <div className="max-w-2xl mx-auto h-full flex flex-col justify-center p-4">
          {error && (
            <div className="text-red-400 mb-4 mt-2">{error}</div>
          )}

          <div className="relative w-full pb-[100%]">
            <div className="absolute inset-0 rounded-lg overflow-hidden bg-opacity-50 bg-gray-800 backdrop-blur-sm">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <img 
                    src="https://i.ibb.co/5Kf5nwH/0622.gif" 
                    alt="Loading" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 right-4 z-10">
                    <div className="w-full h-2 bg-gray-200 bg-opacity-30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {imageUrl && !isLoading && (
                <div 
                  className="w-full h-full cursor-pointer"
                  onClick={addWatermarkAndDownload}
                >
                  <img
                    src={imageUrl}
                    alt="Generated image"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}

              {!imageUrl && !isLoading && (
                <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-300">
                  <ImageIcon size={48} className="mb-4" />
                  <p>Enter a prompt below to generate an image</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4">
        <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>
          <div className="w-full flex items-center rounded-full focus:outline-none max-h-[30vh] px-4 py-2 bg-opacity-50 bg-gray-800 backdrop-blur-md shadow-lg">
            <TextareaAutosize
              className="w-full bg-transparent text-lg resize-none h-[40px] focus:outline-none text-white"
              placeholder="Image prompt..."
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              value={prompt}
            />
            <Button
              type="submit"
              variant="default"
              size="icon"
              className="rounded-full bg-tint aspect-square h-8 disabled:opacity-20 hover:bg-tint/80 ml-2"
              disabled={prompt.trim().length < 2 || isLoading}
            >
              {isLoading ? <ImageIcon className="animate-pulse" size={20} /> : <ArrowUp size={20} />}
            </Button>
          </div>
        </form>
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};