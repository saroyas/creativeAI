"use client";

import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

export function Navbar() {
  const { theme } = useTheme();
  return (
    <header className="w-full flex fixed p-1 z-50 px-2 bg-background justify-between items-center">
      <div>
      <Link href="/" passHref>
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
          <Link href="/image">
            <ImageIcon className="w-4 h-4" />
            Image Generator
          </Link>
        </Button>
      </div>
    </header>
  );
}
