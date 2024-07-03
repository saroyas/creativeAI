"use client";

import React, { useState, useEffect, useRef } from 'react';
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { ArrowUp, Camera, Brush, Image as ImageIcon, Square, RectangleHorizontal, RectangleVertical, Download, Link as LinkIcon, Facebook, MessageCircle } from "lucide-react";
import { Twitter as XLogo } from "lucide-react"; // Import the X logo
import axios from 'axios';
import { env } from "../env.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // Import the useToast hook
import { event } from 'nextjs-google-analytics'; // Import the event function from Google Analytics

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
  const { toast } = useToast(); // Use the useToast hook

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
    event('generate_image', {
      category: 'Generating_Image',
      label: "Generating Image",
    });
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

          event('download_image', {
            category: 'Downloaded',
            label: "Downloaded",
          });
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
    const text = encodeURIComponent("Check out this AI image I made! #UncensoredAI #GenerativeAI");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');

    event('share', {
      category: 'Twitter_Share',
      label: 'Twitter',
    });
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');

    event('share', {
      category: 'Facebook_Share',
      label: 'Facebook',
    });
  };

  const shareOnReddit = () => {
    const title = encodeURIComponent("Check out this AI-generated image!");
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`I created this AI-generated image using the prompt: "${prompt}"\n\nCheck it out here: ${getShareUrl()}`);

    const redditUrl = `https://www.reddit.com/submit?url=${url}&title=${title}&text=${text}`;

    try {
      window.open(redditUrl, '_blank');
      event('share', {
        category: 'Reddit_Share',
        label: 'Reddit',
      });
    } catch (error) {
      console.error('Failed to open Reddit sharing window:', error);
      // Optionally, show a user-friendly error message
    }
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent("Check out this AI-generated image I made!");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');

    event('share', {
      category: 'WhatsApp_Share',
      label: 'WhatsApp',
    });
  };

  const copyLinkToClipboard = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast({
        title: 'Link Copied',
        description: 'The link has been copied to your clipboard.'
      });

      event('copy_link', {
        category: 'Link_Copied_Share',
        label: "Link Copied",
      });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="flex-grow overflow-auto p-4 flex items-center justify-center">
        <div className="w-full max-w-md flex flex-col items-center justify-center">
          {error && (
            <div className="text-red-400 mb-2 text-sm px-2">{error}</div>
          )}

          <div className={`relative overflow-hidden rounded-lg bg-opacity-50 bg-gray-800 backdrop-blur-sm ${getAspectRatioClass()} max-h-[70vh] w-full`}>
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
              <div className="w-full h-full overflow-hidden rounded-lg">
                <img
                  src={imageUrl}
                  alt="Generated image"
                  className="w-full h-full object-cover"
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

          {imageUrl && !isLoading && (
            <div className="mt-4 flex justify-center space-x-2">
              <Button
                onClick={addWatermarkAndDownload}
                className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                aria-label="Download image"
              >
                <Download size={18} className="text-green-500" />
              </Button>
              <Button
                onClick={copyLinkToClipboard}
                className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                aria-label="Copy link to clipboard"
              >
                <LinkIcon size={18} className="text-gray-400" />
              </Button>
              <Button
                onClick={shareOnTwitter}
                className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                aria-label="Share on X (Twitter)"
              >
                <XLogo size={18} className="text-white" />
              </Button>
              <Button
                onClick={shareOnFacebook}
                className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                aria-label="Share on Facebook"
              >
                <Facebook size={18} className="text-blue-600" />
              </Button>
              <Button
                onClick={shareOnReddit}
                className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                aria-label="Share on Reddit"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-500">
                  <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-18c4.411 0 8 3.589 8 8s-3.589 8-8 8-8-3.589-8-8 3.589-8 8-8zm6 9c0-.793-.652-1.436-1.45-1.436-.389 0-.742.15-1.004.398-1.016-.71-2.413-1.168-3.96-1.223l.714-3.356 2.34.498c.03.617.537 1.109 1.16 1.109.642 0 1.16-.518 1.16-1.16 0-.641-.518-1.16-1.16-1.16-.453 0-.845.26-1.037.636l-2.61-.555c-.122-.026-.247.04-.285.16l-.793 3.727c-1.583.028-3.013.486-4.045 1.205-.258-.237-.603-.38-.984-.38C5.652 10.564 5 11.207 5 12c0 .504.27.944.67 1.19-.056.238-.086.484-.086.735 0 2.546 2.982 4.617 6.66 4.617 3.678 0 6.66-2.07 6.66-4.617 0-.239-.027-.473-.078-.7.418-.24.7-.69.7-1.205zm-11.07 1.01c0-.642.518-1.16 1.16-1.16.641 0 1.16.518 1.16 1.16 0 .641-.519 1.16-1.16 1.16-.642 0-1.16-.519-1.16-1.16zm6.415 4.188c-.823.823-2.159.992-2.59.992-.431 0-1.767-.17-2.59-.992-.12-.12-.12-.314 0-.434.12-.12.314-.12.434 0 .583.583 1.545.756 2.156.756.611 0 1.573-.173 2.156-.756.12-.12.314-.12.434 0 .12.12.12.314 0 .434zm-.177-3.03c-.642 0-1.16-.518-1.16-1.16 0-.641.518-1.159 1.16-1.159s1.16.518 1.16 1.16c0 .641-.518 1.16-1.16 1.16z"/>
                </svg>
              </Button>
              <Button
                onClick={shareOnWhatsApp}
                className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200"
                aria-label="Share on WhatsApp"
              >
                <MessageCircle size={18} className="text-green-500" />
              </Button>
            </div>
          )}
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
