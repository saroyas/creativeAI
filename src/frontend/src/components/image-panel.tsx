"use client"
import React, { useState, useEffect } from 'react';
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "./ui/button";
import { ArrowUp, Image as ImageIcon } from "lucide-react";
import axios from 'axios';
import { env } from "../env.mjs";

const BASE_URL = env.NEXT_PUBLIC_API_URL;

export const ImagePanel = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const generateImage = async (promptText: string) => {
    setIsLoading(true);
    setError("");
    setProgress(0);
    setImageUrl(""); // Clear the previous image
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
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : 90));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleImageDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `generated_image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-between py-8 bg-gray-900 text-white">
      <div className="w-full max-w-2xl flex-grow flex flex-col items-center justify-center">
        {error && (
          <div className="text-red-400 mt-2">{error}</div>
        )}

        <div className="relative w-full max-w-2xl aspect-square bg-gray-800 rounded-lg overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <img 
                src="https://i.ibb.co/5Kf5nwH/0622.gif" 
                alt="Loading" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 right-4 z-10">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
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
              onClick={handleImageDownload}
            >
              <img
                src={imageUrl}
                alt="Generated image"
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          {!imageUrl && !isLoading && (
            <div className="w-full h-full flex flex-col items-center justify-center text-center text-gray-400">
              <ImageIcon size={48} className="mb-4" />
              <p>Enter a prompt below to generate an image</p>
            </div>
          )}
        </div>
      </div>

      <form className="w-full max-w-2xl mt-8" onSubmit={handleSubmit}>
        <div className="w-full flex items-center rounded-full focus:outline-none max-h-[30vh] px-2 py-1 bg-gray-800 border-2 border-gray-700">
          <TextareaAutosize
            className="w-full bg-transparent text-lg resize-none h-[40px] focus:outline-none p-2 text-white"
            placeholder="Describe the image you want to generate..."
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            value={prompt}
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="rounded-full bg-blue-600 aspect-square h-8 disabled:opacity-20 hover:bg-blue-700"
            disabled={prompt.trim().length < 2 || isLoading}
          >
            {isLoading ? <ImageIcon className="animate-pulse" size={20} /> : <ArrowUp size={20} />}
          </Button>
        </div>
      </form>
    </div>
  );
};