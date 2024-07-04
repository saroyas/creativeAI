"use client";

import { useState } from 'react';
import { FiLink, FiTwitter, FiFacebook } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { toast } from './ui/use-toast';

interface ShareButtonsProps {
  code: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => `https://www.aiuncensored.info/${encodeURIComponent(code)}`;

  const event = (action: string, params: { category: string; label: string }) => {
    // Implement your event tracking logic here
    console.log('Event:', action, params);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(code + " - AI Uncensored");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    event('Chat_Twitter_Share', { category: 'Twitter_Share', label: 'Twitter' });
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    event('Chat_Facebook_Share', { category: 'Facebook_Share', label: 'Facebook' });
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(code + " - AI Uncensored");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    event('Chat_WhatsApp_Share', { category: 'WhatsApp_Share', label: 'WhatsApp' });
  };

  const copyLinkToClipboard = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Link Copied',
        description: 'The link has been copied to your clipboard.'
      });
      event('Chat_Link_Copied_Share', { category: 'Link_Copied_Share', label: "Link Copied" });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  return (
    <div className="flex justify-center items-center space-x-4">
      <button 
        onClick={copyLinkToClipboard}
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
        aria-label="Copy link"
      >
        <FiLink className={`w-5 h-5 ${copied ? 'text-green-500' : 'text-gray-600'}`} />
      </button>
      <button 
        onClick={shareOnTwitter}
        className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
        aria-label="Share on Twitter"
      >
        <FiTwitter className="w-5 h-5 text-blue-500" />
      </button>
      <button 
        onClick={shareOnFacebook}
        className="p-2 rounded-full bg-indigo-100 hover:bg-indigo-200 transition-colors duration-200"
        aria-label="Share on Facebook"
      >
        <FiFacebook className="w-5 h-5 text-indigo-500" />
      </button>
      <button 
        onClick={shareOnWhatsApp}
        className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors duration-200"
        aria-label="Share on WhatsApp"
      >
        <FaWhatsapp className="w-5 h-5 text-green-500" />
      </button>
    </div>
  );
};