"use client"
import React, { useState } from 'react';
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

  const generateImage = async (promptText: string) => {
    setIsLoading(true);
    setError("");
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 2) return;
    generateImage(prompt);
  };

  return (
    <div className="w-full flex flex-col items-center space-y-4 pt-[200px]">
      <form className="w-full max-w-2xl" onSubmit={handleSubmit}>
        <div className="w-full flex items-center rounded-full focus:outline-none max-h-[30vh] px-2 py-1 bg-card border-2">
          <TextareaAutosize
            className="w-full bg-transparent text-lg resize-none h-[40px] focus:outline-none p-2"
            placeholder="Describe the image you want to generate..."
            onChange={(e) => setPrompt(e.target.value)}
            value={prompt}
          />
          <Button
            type="submit"
            variant="default"
            size="icon"
            className="rounded-full bg-tint aspect-square h-8 disabled:opacity-20 hover:bg-tint/80"
            disabled={prompt.trim().length < 2 || isLoading}
          >
            {isLoading ? <ImageIcon className="animate-pulse" size={20} /> : <ArrowUp size={20} />}
          </Button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}

      {imageUrl && (
        <div className="mt-4 max-w-2xl">
          <img src={imageUrl} alt="Generated image" className="w-full h-auto rounded-lg shadow-lg" />
        </div>
      )}

      {!imageUrl && !isLoading && (
        <div className="text-center text-gray-500 mt-8">
          <ImageIcon size={48} className="mx-auto mb-4" />
          <p>Enter a prompt above to generate an image</p>
        </div>
      )}
    </div>
  );
};