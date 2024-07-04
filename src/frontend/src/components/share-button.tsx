"use client";

import { FiLink, FiTwitter, FiFacebook, FiDownload } from 'react-icons/fi';
import { FaRedditAlien, FaWhatsapp } from 'react-icons/fa';
import { useToast } from "@/components/ui/use-toast";
import { event } from 'nextjs-google-analytics';

interface ShareButtonsProps {
  code: string;
}

export const ShareButtons: React.FC<ShareButtonsProps> = ({ code }) => {
  const { toast } = useToast();

  const getShareUrl = () => `https://www.aiuncensored.info/image/${code}`;

  const shareOnTwitter = () => {
    const text = encodeURIComponent("Check out this AI image I made! #UncensoredAI #GenerativeAI");
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
    const title = encodeURIComponent("Check out this Image I generated using AI!");
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(`I created this AI-generated image.\nCheck it out here: ${getShareUrl()}`);
    window.open(`https://www.reddit.com/submit?url=${url}&title=${title}&text=${text}`, '_blank');
    event('Chat_Reddit_Share', { category: 'Reddit_Share', label: 'Reddit' });
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent("Check out this AI-generated image I made!");
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
    event('Chat_WhatsApp_Share', { category: 'WhatsApp_Share', label: 'WhatsApp' });
  };

  const copyLinkToClipboard = () => {
    const shareUrl = getShareUrl();
    navigator.clipboard.writeText(shareUrl).then(() => {
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
    <div className="flex justify-center space-x-2 mt-4">
      <button onClick={copyLinkToClipboard} className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200" aria-label="Copy link to clipboard">
        <FiLink size={18} className="text-gray-400" />
      </button>
      <button onClick={shareOnTwitter} className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200" aria-label="Share on X (Twitter)">
        <FiTwitter size={18} className="text-blue-400" />
      </button>
      <button onClick={shareOnFacebook} className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200" aria-label="Share on Facebook">
        <FiFacebook size={18} className="text-blue-600" />
      </button>
      <button onClick={shareOnReddit} className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200" aria-label="Share on Reddit">
        <FaRedditAlien size={18} className="text-orange-500" />
      </button>
      <button onClick={shareOnWhatsApp} className="bg-transparent border border-gray-700 p-2 rounded-full hover:bg-gray-800 transition-colors duration-200" aria-label="Share on WhatsApp">
        <FaWhatsapp size={18} className="text-green-500" />
      </button>
    </div>
  );
};