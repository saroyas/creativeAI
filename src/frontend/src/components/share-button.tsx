// src/components/share-button.tsx
"use client";
import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from './ui/button';

interface ShareButtonProps {
  code: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `https://www.aiuncensored.info/${encodeURIComponent(code)}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="flex items-center space-x-2 transition-all duration-200 ease-in-out"
    >
      <Share2 className="w-4 h-4" />
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </Button>
  );
};