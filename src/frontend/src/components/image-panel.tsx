"use client";

import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { ArrowUp, Camera, Brush, ImageIcon, Square, RectangleHorizontal, RectangleVertical, Twitter, Facebook } from "lucide-react";
import axios from 'axios';
import { env } from "../env.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/router';

const BASE_URL = env.NEXT_PUBLIC_API_URL;

type ImageModel = 'anime' | 'photo';
type ImageAspect = 'square' | 'landscape' | 'portrait';

const modelMap: Record<ImageModel, { name: string; icon: React.ReactNode }> = {
  anime: {
    name: "Anime",
    icon: <Brush className="w-4 h-4 text-pink-500" />,
  },
  photo: {
    name: "Photo",
    icon: <Camera className="w-4 h-4 text-blue-500" />,
  },
};

const aspectMap: Record<ImageAspect, { name: string; icon: React.ReactNode }> = {
  square: {
    name: "Square",
    icon: <Square className="w-4 h-4 text-green-500" />,
  },
  landscape: {
    name: "Landscape",
    icon: <RectangleHorizontal className="w-4 h-4 text-green-500" />,
  },
  portrait: {
    name: "Portrait",
    icon: <RectangleVertical className="w-4 h-4 text-green-500" />,
  },
};

interface ImagePanelProps {
  initialImageCode?: string;
}

export const ImagePanel: React.FC<ImagePanelProps> = ({ initialImageCode }) => {
  const [prompt, setPrompt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageCode, setImageCode] = useState<string | null>(initialImageCode || null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ImageModel>('anime');
  const [selectedAspect, setSelectedAspect] = useState<ImageAspect>('square');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (initialImageCode) {
      const fullImageUrl = `https://images.prodia.xyz/${initialImageCode}.png`;
      setImageUrl(fullImageUrl);
    }
  }, [initialImageCode]);

  const generateImage = async (promptText: string) => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    setImageUrl("");
    setTaskId(null);
    try {
      const response = await axios.post(`${BASE_URL}/image`, {
        prompt: promptText,
        model: selectedModel,
        aspect: selectedAspect,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.task_id) {
        setTaskId(response.data.task_id);
        pollTaskStatus(response.data.task_id);
      } else if (response.data.error) {
        setError(response.data.error);
        setIsLoading(false);
      }
    } catch (err) {
      setError("Too many requests for today. Try again tomorrow.");
      console.error("Error initiating image generation:", err);
      setIsLoading(false);
    }
  };

  const pollTaskStatus = async (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${BASE_URL}/image/status/${id}`, {
          withCredentials: true,
        });
        const status = response.data.status;
        if (status === "completed") {
          clearInterval(pollInterval);
          setImageUrl(response.data.image_url);
          setIsLoading(false);
          setProgress(100);
          setImageCode(getImageCode(response.data.image_url));
        } else if (status === "failed") {
          clearInterval(pollInterval);
          setError(response.data.error || "Image generation failed. Please try again.");
          setIsLoading(false);
        } else {
          setProgress((prev) => (prev < 90 ? prev + 10 : 90));
        }
      } catch (err) {
        console.error("Error polling task status:", err);
        clearInterval(pollInterval);
        setError("Failed to check image generation status. Please try again.");
        setIsLoading(false);
      }
    }, 2000);
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

      const watermarkText = 'AI Uncensored';
      const fontSize = Math.max(16, canvas.width / 40);
      ctx.font = `bold ${fontSize}px 'Arial', sans-serif`;
      const padding = fontSize;

      const x = canvas.width - padding;
      const y = canvas.height - padding;

      const gradientHeight = canvas.height / 3;
      const gradient = ctx.createLinearGradient(0, canvas.height - gradientHeight, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.6)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - gradientHeight, canvas.width, gradientHeight);

      ctx.fillStyle = 'rgba(255, 255, 255, 1)';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';

      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      for (let i = 0; i < 3; i++) {
        ctx.fillText(watermarkText, x, y);
      }

      ctx.shadowColor = 'rgba(0, 0, 0, 0)';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

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

  const getAspectRatioClass = () => {
    switch (selectedAspect) {
      case 'landscape':
        return 'aspect-[16/9]';
      case 'portrait':
        return 'aspect-[9/16]';
      default:
        return 'aspect-square';
    }
  };

  const getLoadingGifClass = () => {
    switch (selectedAspect) {
      case 'landscape':
        return 'w-full h-auto';
      case 'portrait':
        return 'h-full w-auto';
      default:
        return 'w-full h-full';
    }
  };

  const getImageCode = (url: string) => {
    const parts = url.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.split('.')[0]; // Remove the file extension
  };

  const getShareUrl = () => {
    const code = imageCode || getImageCode(imageUrl);
    return `https://www.aiuncensored.info/image/${code}`;
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent("Check out this AI-generated image!");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const shareOnReddit = () => {
    const title = encodeURIComponent("AI-Generated Image");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.reddit.com/submit?title=${title}&url=${url}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-grow overflow-auto p-4 flex items-center justify-center">
        <div className="w-full max-w-md">
          {error && (
            <div className="text-red-400 mb-2 text-sm px-2">{error}</div>
          )}

          <div className={`relative overflow-hidden rounded-lg bg-opacity-50 bg-gray-800 backdrop-blur-sm ${getAspectRatioClass()}`}>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                <img
                  src="https://i.ibb.co/5Kf5nwH/0622.gif"
                  alt="Loading"
                  className={`object-cover ${getLoadingGifClass()}`}
                />
                <div className="absolute bottom-2 left-2 right-2 z-10">
                  <div className="w-full h-1 bg-gray-200 bg-opacity-30 rounded-full overflow-hidden">
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
                className="w-full h-full cursor-pointer overflow-hidden rounded-lg"
                onClick={addWatermarkAndDownload}
              >
                <img
                  src={imageUrl}
                  alt="Generated image"
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); shareOnTwitter(); }}
                    className="bg-blue-400 p-2 rounded-full hover:bg-blue-500 transition-colors duration-200"
                    aria-label="Share on Twitter"
                  >
                    <Twitter size={20} color="white" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); shareOnReddit(); }}
                    className="bg-orange-500 p-2 rounded-full hover:bg-orange-600 transition-colors duration-200"
                    aria-label="Share on Reddit"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M24 11.779c0-1.459-1.192-2.645-2.657-2.645-.715 0-1.363.286-1.84.746-1.81-1.191-4.259-1.949-6.971-2.046l1.483-4.669 4.016.941-.006.058c0 1.193.975 2.163 2.174 2.163 1.198 0 2.172-.97 2.172-2.163s-.975-2.164-2.172-2.164c-.92 0-1.704.574-2.021 1.379l-4.329-1.015c-.189-.046-.381.063-.44.249l-1.654 5.207c-2.838.034-5.409.798-7.3 2.025-.474-.438-1.103-.712-1.799-.712-1.465 0-2.656 1.187-2.656 2.646 0 .97.533 1.811 1.317 2.271-.052.282-.086.567-.086.857 0 3.911 4.808 7.093 10.719 7.093s10.72-3.182 10.72-7.093c0-.274-.029-.544-.075-.81.832-.447 1.405-1.312 1.405-2.318zm-17.224 1.816c0-.868.71-1.575 1.582-1.575.872 0 1.581.707 1.581 1.575s-.709 1.574-1.581 1.574-1.582-.706-1.582-1.574zm9.061 4.669c-.797.793-2.048 1.179-3.824 1.179l-.013-.003-.013.003c-1.777 0-3.028-.386-3.824-1.179-.145-.144-.145-.379 0-.523.145-.145.381-.145.526 0 .65.647 1.729.961 3.298.961l.013.003.013-.003c1.569 0 2.648-.315 3.298-.962.145-.145.381-.144.526 0 .145.145.145.379 0 .524zm-.189-3.095c-.872 0-1.581-.706-1.581-1.574 0-.868.709-1.575 1.581-1.575s1.581.707 1.581 1.575-.709 1.574-1.581 1.574z"/>
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); shareOnFacebook(); }}
                    className="bg-blue-600 p-2 rounded-full hover:bg-blue-700 transition-colors duration-200"
                    aria-label="Share on Facebook"
                  >
                    <Facebook size={20} color="white" />
                  </button>
                </div>
              </div>
            )}

            {!imageUrl && !isLoading && (
              <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-300 p-2">
                <ImageIcon size={36} className="mb-2" />
                <p className="text-sm">Enter a prompt below to generate an image</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sticky bottom-0 left-0 right-0 backdrop-blur-md">
        <form className="max-w-2xl mx-auto" onSubmit={handleSubmit}>
          <div className="flex justify-center mb-2">
            <Select
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value as ImageModel)}
            >
              <SelectTrigger className="w-fit space-x-2 bg-transparent outline-none border border-gray-700 select-none focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-sm">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    {modelMap[selectedModel].icon}
                    <span className="font-semibold">{modelMap[selectedModel].name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[120px] z-50">
                {Object.entries(modelMap).map(([value, { name, icon }]) => (
                  <SelectItem key={value} value={value} className="flex flex-col items-start p-2">
                    <div className="flex items-center space-x-2">
                      {icon}
                      <span className="font-bold">{name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={selectedAspect}
              onValueChange={(value) => setSelectedAspect(value as ImageAspect)}
            >
              <SelectTrigger className="w-fit space-x-2 bg-transparent outline-none border border-gray-700 select-none focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-sm ml-4">
                <SelectValue>
                  <div className="flex items-center space-x-2">
                    {aspectMap[selectedAspect].icon}
                    <span className="font-semibold">{aspectMap[selectedAspect].name}</span>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-[120px] z-50">
                {Object.entries(aspectMap).map(([value, { name, icon }]) => (
                  <SelectItem key={value} value={value} className="flex flex-col items-start p-2">
                    <div className="flex items-center space-x-2">
                      {icon}
                      <span className="font-bold">{name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full flex items-center rounded-full focus:outline-none max-h-[30vh] px-3 py-2 bg-opacity-50 bg-gray-800 backdrop-blur-md shadow-lg">
            <TextareaAutosize
              className="w-full bg-transparent text-base sm:text-lg resize-none h-[36px] focus:outline-none text-white"
              placeholder="Describe the image..."
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
              {isLoading ? <ImageIcon className="animate-pulse" size={18} /> : <ArrowUp size={18} />}
            </Button>
          </div>
        </form>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};
