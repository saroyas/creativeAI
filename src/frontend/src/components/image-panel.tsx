"use client";
import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { ArrowUp, Image as ImageIcon } from "lucide-react";
import axios from 'axios';
import { env } from "../env.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BASE_URL = env.NEXT_PUBLIC_API_URL;

type ImageModel = 'anime' | 'photo';

const modelMap: Record<ImageModel, { name: string; icon: React.ReactNode }> = {
  anime: {
    name: "Anime",
    icon: <ImageIcon className="w-4 h-4 text-pink-500" />,
  },
  photo: {
    name: "Photo",
    icon: <ImageIcon className="w-4 h-4 text-blue-500" />,
  },
};

export const ImagePanel: React.FC = () => {
  const [prompt, setPrompt] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ImageModel>('photo');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const generateImage = async (promptText: string) => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    setImageUrl("");
    setTaskId(null);
    try {
      const response = await axios.post(`${BASE_URL}/image`, {
        prompt: promptText,
        model: selectedModel
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
      setError("Failed to initiate image generation. Please try again.");
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
        } else if (status === "failed") {
          clearInterval(pollInterval);
          setError(response.data.error || "Image generation failed. Please try again.");
          setIsLoading(false);
        } else {
          // Update progress for "processing" status
          setProgress((prev) => (prev < 90 ? prev + 10 : 90));
        }
      } catch (err) {
        console.error("Error polling task status:", err);
        clearInterval(pollInterval);
        setError("Failed to check image generation status. Please try again.");
        setIsLoading(false);
      }
    }, 2000); // Poll every 2 seconds
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

  return (
    <div className="w-full min-h-screen flex flex-col">
      <div className="flex-grow overflow-auto p-0 sm:p-1 md:p-2">
        <div className="w-full max-w-md mx-auto h-full flex flex-col justify-center">
          {error && (
            <div className="text-red-400 mb-2 mt-1 text-sm px-2">{error}</div>
          )}

          <div className="relative w-full pb-[100%]">
            <div className="absolute inset-0 overflow-hidden bg-opacity-50 bg-gray-800 backdrop-blur-sm rounded-lg">
              {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <img
                    src="https://i.ibb.co/5Kf5nwH/0622.gif"
                    alt="Loading"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute top-2 left-2 right-2 z-10">
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
                  className="w-full h-full cursor-pointer"
                  onClick={addWatermarkAndDownload}
                >
                  <img
                    src={imageUrl}
                    alt="Generated image"
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105 rounded-lg"
                  />
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
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-2 sm:p-4">
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
          </div>
          <div className="w-full flex items-center rounded-full focus:outline-none max-h-[30vh] px-3 py-2 bg-opacity-50 bg-gray-800 backdrop-blur-md shadow-lg">
            <TextareaAutosize
              className="w-full bg-transparent text-base sm:text-lg resize-none h-[36px] focus:outline-none text-white"
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
              {isLoading ? <ImageIcon className="animate-pulse" size={18} /> : <ArrowUp size={18} />}
            </Button>
          </div>
        </form>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};