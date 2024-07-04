"use client";

import { useState } from 'react';
import { FiLink, FiTwitter, FiFacebook } from 'react-icons/fi';
import { FaRedditAlien, FaWhatsapp } from 'react-icons/fa';
import { useToast } from "@/components/ui/use-toast";
import { event } from 'nextjs-google-analytics';

interface ShareButtonsProps {
  code: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ code }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const getShareUrl = () => `https://www.aiuncensored.info/image/${code}`;

  const shareOnTwitter = () => {
    const text = encodeURIComponent(code + " - Uncensored AI #UncensoredAI #GenerativeAI");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    event('Chat_Twitter_Share', { category: 'Twitter_Share', label: 'Twitter' });
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    event('Chat_Facebook_Share', { category: 'Facebook_Share', label: 'Facebook' });
  };

  const shareOnReddit = () => {
    const title = encodeURIComponent(code + " - Uncensored AI");
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`${code} - Uncensored AI: ${getShareUrl()}`);
    window.open(`https://www.reddit.com/submit?url=${url}&title=${title}&text=${text}`, '_blank');
    event('Chat_Reddit_Share', { category: 'Reddit_Share', label: 'Reddit' });
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(code + " - Uncensored AI");
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
      event('Link_Copied_Share', { category: 'Link_Copied_Share', label: "Link Copied" });
    }).catch(err => {
      console.error('Failed to copy link: ', err);
    });
  };

  return (
    <div className="flex justify-center items-center space-x-6 my-4">
      {[
        { icon: FiLink, onClick: copyLinkToClipboard, label: "Copy link", bgColor: copied ? "bg-green-700" : "bg-gray-800", iconColor: "text-gray-200" },
        { icon: FiTwitter, onClick: shareOnTwitter, label: "Share on Twitter", bgColor: "bg-blue-900", iconColor: "text-blue-200" },
        { icon: FiFacebook, onClick: shareOnFacebook, label: "Share on Facebook", bgColor: "bg-indigo-900", iconColor: "text-indigo-200" },
        { icon: FaRedditAlien, onClick: shareOnReddit, label: "Share on Reddit", bgColor: "bg-orange-900", iconColor: "text-orange-200" },
        { icon: FaWhatsapp, onClick: shareOnWhatsApp, label: "Share on WhatsApp", bgColor: "bg-green-900", iconColor: "text-green-200" },
      ].map(({ icon: Icon, onClick, label, bgColor, iconColor }, index) => (
        <button 
          key={index}
          onClick={onClick}
          className={`p-4 rounded-full ${bgColor} transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-opacity-50 focus:ring-gray-400`}
          aria-label={label}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </button>
      ))}
    </div>
  );
};