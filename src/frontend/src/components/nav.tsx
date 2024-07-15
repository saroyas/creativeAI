"use client";
import React, { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

export function Navbar() {
  const { theme } = useTheme();
  const router = useRouter();

  const handleLogoClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/');
    // Reload the page after navigation
    setTimeout(() => {
      location.reload()
    }, 100);
    // Use a short timeout to allow for navigation before reload
  }, [router]);
  
  const handleImageGeneratorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.location.href = 'https://www.ai-porn.tv/';
  };
  
  return (
    <header className="w-full flex fixed p-1 z-50 px-2 bg-background justify-between items-center">
      <div>
        <Link href="/" passHref onClick={handleLogoClick}>
          <img
            src={theme === "light" ? "/logo.png" : "/logo.png"}
            alt="Logo"
            className="w-12 h-12 rounded-lg transform transition-transform duration-200 hover:scale-110"
          />
        </Link>
      </div>
      <div>
        <Button
          asChild
          variant="outline"
          className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
        >
          <a href="https://www.ai-porn.tv/" onClick={handleImageGeneratorClick}>
            <ImageIcon className="w-4 h-4" />
            Image Generator
          </a>
        </Button>
      </div>
    </header>
  );
}