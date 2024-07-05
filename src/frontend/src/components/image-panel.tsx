"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { ArrowUp, ScanFace, Camera, Brush, Image as ImageIcon, Square, RectangleHorizontal, RectangleVertical, Download, Link as LinkIcon, Facebook, MessageCircle, Share2 } from "lucide-react";
import { Twitter as XLogo } from "lucide-react"; // Import the X logo
import axios from 'axios';
import { env } from "../env.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast"; // Import the useToast hook
import { event } from 'nextjs-google-analytics'; // Import the event function from Google Analytics
import { FiLink, FiTwitter, FiFacebook, FiDownload } from 'react-icons/fi';
import { FaRedditAlien, FaWhatsapp } from 'react-icons/fa';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';

const BASE_URL = env.NEXT_PUBLIC_API_URL;
const FREEIMAGE_HOST_API_KEY = "2c8b0486abf7f088f0c8a4fc68853f8e";

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
  const [selectedModel, setSelectedModel] = useState<ImageModel>('photo');
  const [selectedAspect, setSelectedAspect] = useState<ImageAspect>('square');
  const [selectedShare, setSelectedShare] = useState<string>('twitter');
  const [sourceImageUrl, setSourceImageUrl] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast(); // Use the useToast hook
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (initialImageCode) {
      const fullImageUrl = `https://images.prodia.xyz/${initialImageCode}.png`;
      setImageUrl(fullImageUrl);
    }
  }, [initialImageCode]);

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
          }
        }
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  const preventRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const generateImage = async (promptText: string) => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    setTaskId(null);
    event('Generating_Image_Started', {
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
      setError("Too many requests. Try again after a short break.");
      console.error("Error initiating image generation:", err);
      setIsLoading(false);
    }
  };

  const pollTaskStatus = async (id: string, time: number = 2000) => {
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
          event('Generating_Image_Completed', {
            category: 'Generating_Image',
            label: "Generating Image",
          });
        } else if (status === "failed") {
          clearInterval(pollInterval);
          setError(response.data.error || "Image generation failed. Please try again.");
          setIsLoading(false);
        } else {
          setProgress((prev) => (prev < 90 ? prev + 10 : 90));
        }
        console.log("Task Status:", status);
      } catch (err) {
        console.error("Error polling task status:", err);
        clearInterval(pollInterval);
        setError("Network Error. Please try again.");
        setIsLoading(false);
      }
    }, time);
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

          event('Downloaded_Image', {
            category: 'Downloaded_Image',
            label: "Downloaded Image",
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

    event('Twitter_Share', {
      category: 'Twitter_Share',
      label: 'Twitter',
    });
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');

    event('Facebook_Share', {
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
      event('Reddit_Share', {
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

    event('WhatsApp_Share', {
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

      event('Link_Copied_Share', {
        category: 'Link_Copied_Share',
        label: "Link Copied",
      });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  const uploadImageToFreeImageHost = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('key', FREEIMAGE_HOST_API_KEY);
    formData.append('image', file);

    try {
      const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        return response.data.data.url;
      } else {
        throw new Error('Image upload failed');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadImageToFreeImageHost(file);
        setSourceImageUrl(uploadedUrl);
        // Automatically trigger face swap after uploading
        await handleFaceSwap(uploadedUrl);
      } catch (error) {
        console.error('Failed to upload image or perform face swap:', error);
        toast({
          title: 'Operation Failed',
          description: 'Failed to upload the image or perform face swap. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    }
  }, [imageUrl]);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFaceSwap = async (sourceUrl: string) => {
    if (!sourceUrl || !imageUrl) {
      toast({
        title: 'Error',
        description: 'Both source and target images are required for face swap.'
      });
      return;
    }

    setIsLoading(true);
    setError("");
    setProgress(0);
    setTaskId(null);
    event('Faceswap_Image_Started', {
      category: 'Faceswap_Image_Started',
      label: "Faceswap_Image_Started",
    });
    console.log("Triggering face swap sourceImageUrl: ", sourceUrl, " image Url: ", imageUrl);

    try {
      const response = await axios.post(`${BASE_URL}/faceswap`, {
        sourceUrl: sourceUrl,
        targetUrl: imageUrl
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
      }
    } catch (err) {
      setError("Face swap request failed. Try again after a short break.");
      console.error("Error initiating face swap:", err);
    } finally {
      // setIsLoading(false);
    }
  };

  const FaceSwapButton = () => {
    const handleFaceSwapClick = () => {
      if (!imageUrl) {
        toast({
          title: 'Generate an image first',
          description: 'You need to generate an image before performing a face swap.',
          duration: 3000,
        });
      } else {
        triggerFileInput();
      }
    };

    return (
      <Button
        onClick={handleFaceSwapClick}
        className="flex-grow basis-0 min-w-0 bg-transparent border border-gray-700 focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-xs sm:text-sm px-2 py-1.5 relative overflow-hidden"
      >
        <div className="flex items-center space-x-1 relative z-10 truncate">
          <ScanFace size={16} className="text-purple-400 flex-shrink-0" />
          <span className="font-semibold text-white truncate">Face swap</span>
        </div>
      </Button>
    );
  };

  const shareMap: Record<string, { name: string; icon: React.ReactNode; action: () => void }> = {
    copy: {
      name: "Copy Link",
      icon: <FiLink size={18} className="text-gray-400" />,
      action: copyLinkToClipboard,
    },
    twitter: {
      name: "Twitter",
      icon: <FiTwitter size={18} className="text-blue-400" />,
      action: shareOnTwitter,
    },
    facebook: {
      name: "Facebook",
      icon: <FiFacebook size={18} className="text-blue-600" />,
      action: shareOnFacebook,
    },
    reddit: {
      name: "Reddit",
      icon: <FaRedditAlien size={18} className="text-orange-500" />,
      action: shareOnReddit,
    },
    whatsapp: {
      name: "WhatsApp",
      icon: <FaWhatsapp size={18} className="text-green-500" />,
      action: shareOnWhatsApp,
    },
  };
  
  const ShareButton = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    const handleToggle = () => {
      if (!isOpen) {
        copyLinkToClipboard();
      }
      event('SHARE_BUTTON_CLICKED', {
        category: 'image_link_copied',
        label: "image_link_copied",
      });

      setIsOpen(!isOpen);
    };
  
    const handleShare = (action: () => void) => {
      action();
      setIsOpen(false);
    };
  
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && !(event.target as Element).closest('.share-button-container')) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);
  
    return (
      <div className="relative share-button-container">
        <Button
          onClick={handleToggle}
          className={`bg-transparent border border-gray-700 p-2 rounded-full transition-colors duration-200 ${
            isOpen ? 'bg-gray-700' : 'hover:bg-gray-800'
          }`}
          aria-label="Share"
          aria-expanded={isOpen}
        >
          <Share2 size={18} className={isOpen ? 'text-white' : 'text-gray-400'} />
        </Button>
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-gray-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              {Object.entries(shareMap).map(([key, { name, icon, action }]) => (
                <button
                  key={key}
                  onClick={() => handleShare(action)}
                  className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left"
                  role="menuitem"
                >
                  {icon}
                  <span className="ml-2">{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
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
              <div className="absolute inset-0 flex items-center justify-center">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Background"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                ) :
                  <img
                    src="https://i.ibb.co/5Kf5nwH/0622.gif"
                    alt="Loading"
                    className={`object-cover ${getLoadingGifClass()}`}
                  />
                }
                <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">

                </div>
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
              <div className="w-full h-full overflow-hidden rounded-lg relative">
                <canvas
                  ref={canvasRef}
                  className="w-full h-full object-cover"
                  onContextMenu={preventRightClick}
                />
                <div
                  ref={overlayRef}
                  className="absolute inset-0 bg-transparent"
                  onContextMenu={preventRightClick}
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
                className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200 ring-2 ring-green-500"
                aria-label="Download image"
              >
                <FiDownload size={18} className="text-green-500" />
              </Button>
              <ShareButton />
              <FaceSwapButton />
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sticky bottom-0 left-0 right-0 backdrop-blur-md">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-2 space-x-3">
            <div className="flex space-x-3 max-w-[400px] w-full">
              <Select
                value={selectedModel}
                onValueChange={(value) => setSelectedModel(value as ImageModel)}
              >
                <SelectTrigger className="flex-grow basis-0 min-w-0 bg-transparent border border-gray-700 focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-xs sm:text-sm px-2 py-1.5">
                  <SelectValue>
                    <div className="flex items-center space-x-1 truncate">
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
                <SelectTrigger className="flex-grow basis-0 min-w-0 bg-transparent border border-gray-700 focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-xs sm:text-sm px-2 py-1.5">
                  <SelectValue>
                    <div className="flex items-center space-x-1 truncate">
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
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  triggerFileInput();
                }}
                type="button"
                className="flex-grow basis-0 min-w-0 bg-transparent border border-gray-700 focus:ring-0 shadow-none transition-all duration-200 ease-in-out hover:scale-[1.05] text-xs sm:text-sm px-2 py-1.5 relative overflow-hidden"
                style={{
                  backgroundImage: sourceImageUrl ? `url(${sourceImageUrl})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="flex items-center space-x-1 relative z-10 truncate">
                  {sourceImageUrl ? (
                    <UserCheck size={16} className="text-purple-400 flex-shrink-0" />
                  ) : (
                    <UserPlus size={16} className="text-gray-400 flex-shrink-0" />
                  )}
                  <span className="font-semibold text-white truncate">
                    {sourceImageUrl ? 'Edit face' : 'Add face'}
                  </span>
                </div>
              </Button>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
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
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
    </div>
  );
};
