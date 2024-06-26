import React from 'react';
import Link from "next/link";
import { Button } from "./ui/button";
import { SiX } from "react-icons/si";

export function Footer({
  handleSend,
}: {
  handleSend: (message: string) => void;
}) {
  const sendAboutUs = () => {
    handleSend("About Us");
  };

  return (
    <footer className="w-full fixed bottom-0 right-0 p-1 z-50 bg-background/95 flex justify-center items-center">
      <div className="flex flex-row items-center space-x-2">
        <button
          onClick={sendAboutUs}
          className="text-xs font-medium hover:text-dark-grey transition-colors duration-200 ease-in-out"
        >
          Who are we?
        </button>
      </div>
    </footer>
  );
}
